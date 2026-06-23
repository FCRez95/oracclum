package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	httpadapter "github.com/FCRez95/tbl-ingestion-api/internal/adapter/http"
	mysqladapter "github.com/FCRez95/tbl-ingestion-api/internal/adapter/mysql"
	appconfig "github.com/FCRez95/tbl-ingestion-api/internal/config"
	"github.com/FCRez95/tbl-ingestion-api/internal/infra/cache"
	"github.com/FCRez95/tbl-ingestion-api/internal/infra/queue"
	"github.com/FCRez95/tbl-ingestion-api/internal/usecase"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/retry"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

const shutdownTimeout = 15 * time.Second

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	settings, err := appconfig.Load()
	if err != nil {
		log.Fatal(err)
	}

	// Reuse a tuned HTTP transport for AWS SDK calls.
	transport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		// Keep idle connections available for ingestion bursts.
		MaxIdleConns:        256,
		MaxIdleConnsPerHost: 256,
		IdleConnTimeout:     90 * time.Second,
		// Bound connection setup while keeping established connections warm.
		DialContext: (&net.Dialer{
			Timeout:   2 * time.Second,
			KeepAlive: 60 * time.Second,
		}).DialContext,
		TLSHandshakeTimeout:   2 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	httpClient := &http.Client{
		Transport: transport,
		Timeout:   5 * time.Second, // bound each AWS request; SQS sends should finish within this
	}

	cfg, err := loadAWS(ctx, settings.AWSRegion, settings.SQSEndpoint)
	if err != nil {
		log.Fatal(err)
	}

	cfg.HTTPClient = httpClient

	if settings.AWSRetryLight {
		cfg.Retryer = func() aws.Retryer {
			return retry.NewStandard(func(o *retry.StandardOptions) {
				o.MaxAttempts = 2 // one initial attempt and one retry
			})
		}
	}

	// Reuse one SQS client for the process lifetime.
	sqsClient := sqs.NewFromConfig(cfg)

	// Batched SQS output adapter.
	sink := queue.NewSQSBatchedSink(sqsClient, settings.SQSQueueURL)

	// Load the click_auth map from MySQL at startup.
	db, err := sql.Open("mysql", settings.MySQLDSN())
	if err != nil {
		log.Fatal(err)
	}

	initialMap, err := mysqladapter.GetCampaignMap(ctx, db)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("loaded %d campaign auth mappings", len(initialMap))

	// Keep request-time auth lookup in memory instead of hitting MySQL per click.
	authCache := cache.NewResolver(initialMap)

	save := usecase.NewSaveClick(usecase.SaveDeps{
		Sink:   sink,
		Lookup: authCache,
		Now:    time.Now,
	})

	r := gin.Default()
	public := r.Group("/")
	public.Use(httpadapter.PublicCORS())
	httpadapter.RegisterRoutes(public, save)

	if settings.AdminToken == "" {
		log.Print("admin routes disabled: ADMIN_TOKEN is not set")
	} else {
		admin := r.Group("/admin")
		admin.Use(httpadapter.RequireBearerToken(settings.AdminToken))
		httpadapter.RegisterEditMapRoutes(admin, authCache)
	}

	srv := &http.Server{
		Addr:    settings.Addr,
		Handler: r,
	}

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("listening on %s", settings.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
			return
		}
		serverErr <- nil
	}()

	select {
	case <-ctx.Done():
		log.Print("shutdown signal received")
	case err := <-serverErr:
		if err != nil {
			log.Fatal(err)
		}
		return
	}

	stop()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	log.Print("stopping HTTP server")
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("HTTP shutdown error: %v", err)
		if closeErr := srv.Close(); closeErr != nil {
			log.Printf("HTTP server close error: %v", closeErr)
		}
	}

	log.Print("flushing SQS sink")
	if err := sink.Close(); err != nil {
		log.Printf("SQS sink close error: %v", err)
	}

	log.Print("closing database connection")
	if err := db.Close(); err != nil {
		log.Printf("database close error: %v", err)
	}

	select {
	case err := <-serverErr:
		if err != nil {
			log.Printf("HTTP server stopped with error: %v", err)
		}
	case <-shutdownCtx.Done():
		log.Printf("HTTP server did not stop before timeout: %v", shutdownCtx.Err())
	}

	log.Print("shutdown complete")
}

func loadAWS(ctx context.Context, region, endpoint string) (aws.Config, error) {
	if endpoint == "" {
		return awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	}
	return awsconfig.LoadDefaultConfig(ctx,
		awsconfig.WithRegion(region),
		awsconfig.WithEndpointResolverWithOptions(
			aws.EndpointResolverWithOptionsFunc(func(service, _ string, _ ...interface{}) (aws.Endpoint, error) {
				if strings.Contains(strings.ToLower(service), "sqs") {
					return aws.Endpoint{URL: endpoint, HostnameImmutable: true}, nil
				}
				return aws.Endpoint{}, &aws.EndpointNotFoundError{}
			})))
}
