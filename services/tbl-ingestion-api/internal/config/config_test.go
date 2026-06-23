package config

import (
	"strings"
	"testing"
)

func TestLoadAppliesDefaults(t *testing.T) {
	cfg, err := load(mapLookup(map[string]string{
		"SQS_QUEUE_URL": "http://localhost:4566/000000000000/click-events",
		"DB_USERNAME":   "root",
		"DB_PASSWORD":   "local-password",
		"DB_NAME":       "tbl_ingestion",
	}))
	if err != nil {
		t.Fatalf("load config: %v", err)
	}

	if cfg.Addr != ":8080" {
		t.Fatalf("expected default addr, got %q", cfg.Addr)
	}
	if cfg.AWSRegion != "sa-east-1" {
		t.Fatalf("expected default AWS region, got %q", cfg.AWSRegion)
	}
	if cfg.DBHost != "127.0.0.1" {
		t.Fatalf("expected default DB host, got %q", cfg.DBHost)
	}
	if cfg.DBPort != "3306" {
		t.Fatalf("expected default DB port, got %q", cfg.DBPort)
	}
	if cfg.AdminToken != "" {
		t.Fatalf("expected admin token to be optional, got %q", cfg.AdminToken)
	}
}

func TestLoadUsesDotEnvFallback(t *testing.T) {
	dotEnv := map[string]string{
		"SQS_QUEUE_URL": "http://localhost:4566/000000000000/click-events",
		"DB_USERNAME":   "from-file",
		"DB_PASSWORD":   "local-password",
		"DB_NAME":       "tbl_ingestion",
		"DB_HOST":       "mysql",
	}
	processEnv := map[string]string{
		"DB_USERNAME": "from-process",
	}

	cfg, err := load(lookupWithFallback(mapLookup(processEnv), dotEnv))
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	if cfg.DBUsername != "from-process" {
		t.Fatalf("expected process env to override .env value, got %q", cfg.DBUsername)
	}
	if cfg.DBPassword != "local-password" {
		t.Fatalf("expected DB password from .env, got %q", cfg.DBPassword)
	}
	if cfg.DBHost != "mysql" {
		t.Fatalf("expected DB host from .env, got %q", cfg.DBHost)
	}
}

func TestLoadReportsMissingRequiredEnvVars(t *testing.T) {
	_, err := load(mapLookup(nil))
	if err == nil {
		t.Fatal("expected missing config error")
	}

	got := err.Error()
	for _, want := range []string{"SQS_QUEUE_URL", "DB_USERNAME", "DB_PASSWORD", "DB_NAME"} {
		if !strings.Contains(got, want) {
			t.Fatalf("expected error to mention %s, got %q", want, got)
		}
	}
	if strings.Contains(got, "DB_HOST") || strings.Contains(got, "DB_PORT") {
		t.Fatalf("defaulted DB vars should not be reported missing: %q", got)
	}
}

func TestLoadParsesAWSRetryLight(t *testing.T) {
	for _, value := range []string{"1", "true", "TRUE"} {
		cfg, err := load(mapLookup(validEnvWith("AWS_RETRY_LIGHT", value)))
		if err != nil {
			t.Fatalf("load with AWS_RETRY_LIGHT=%q: %v", value, err)
		}
		if !cfg.AWSRetryLight {
			t.Fatalf("expected AWS_RETRY_LIGHT=%q to parse true", value)
		}
	}

	for _, value := range []string{"", "0", "false", "FALSE"} {
		cfg, err := load(mapLookup(validEnvWith("AWS_RETRY_LIGHT", value)))
		if err != nil {
			t.Fatalf("load with AWS_RETRY_LIGHT=%q: %v", value, err)
		}
		if cfg.AWSRetryLight {
			t.Fatalf("expected AWS_RETRY_LIGHT=%q to parse false", value)
		}
	}

	_, err := load(mapLookup(validEnvWith("AWS_RETRY_LIGHT", "sometimes")))
	if err == nil {
		t.Fatal("expected invalid AWS_RETRY_LIGHT value to fail")
	}
	if !strings.Contains(err.Error(), "AWS_RETRY_LIGHT") {
		t.Fatalf("expected AWS_RETRY_LIGHT validation error, got %q", err.Error())
	}
}

func TestMySQLDSN(t *testing.T) {
	cfg := Config{
		DBUsername: "root",
		DBPassword: "local-password",
		DBName:     "tbl_ingestion",
		DBHost:     "127.0.0.1",
		DBPort:     "3306",
	}

	want := "root:local-password@tcp(127.0.0.1:3306)/tbl_ingestion?parseTime=true"
	if got := cfg.MySQLDSN(); got != want {
		t.Fatalf("expected DSN %q, got %q", want, got)
	}
}

func TestParseDotEnv(t *testing.T) {
	values, err := parseDotEnv(`
# local development
export DB_USERNAME=root
DB_PASSWORD="local password"
DB_NAME='tbl_ingestion'
SQS_QUEUE_URL=http://localhost:4566/000000000000/click-events
EMPTY=
`)
	if err != nil {
		t.Fatalf("parse .env: %v", err)
	}

	want := map[string]string{
		"DB_USERNAME":   "root",
		"DB_PASSWORD":   "local password",
		"DB_NAME":       "tbl_ingestion",
		"SQS_QUEUE_URL": "http://localhost:4566/000000000000/click-events",
		"EMPTY":         "",
	}
	for key, value := range want {
		if got := values[key]; got != value {
			t.Fatalf("expected %s=%q, got %q", key, value, got)
		}
	}
}

func TestParseDotEnvRejectsInvalidLines(t *testing.T) {
	if _, err := parseDotEnv("not-a-valid-line"); err == nil {
		t.Fatal("expected invalid line to fail")
	}
	if _, err := parseDotEnv("1INVALID=value"); err == nil {
		t.Fatal("expected invalid key to fail")
	}
	if _, err := parseDotEnv(`KEY="unterminated`); err == nil {
		t.Fatal("expected unterminated quoted value to fail")
	}
}

func mapLookup(values map[string]string) lookupFunc {
	return func(key string) string {
		return values[key]
	}
}

func validEnvWith(key, value string) map[string]string {
	env := map[string]string{
		"SQS_QUEUE_URL": "http://localhost:4566/000000000000/click-events",
		"DB_USERNAME":   "root",
		"DB_PASSWORD":   "local-password",
		"DB_NAME":       "tbl_ingestion",
	}
	env[key] = value
	return env
}
