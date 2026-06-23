package config

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"unicode"

	mysql "github.com/go-sql-driver/mysql"
)

type Config struct {
	Addr          string
	AWSRegion     string
	AWSRetryLight bool

	SQSQueueURL string
	SQSEndpoint string

	DBUsername string
	DBPassword string
	DBName     string
	DBHost     string
	DBPort     string

	AdminToken string
}

func Load() (Config, error) {
	dotEnv, err := readDotEnv(".env")
	if err != nil {
		return Config{}, err
	}
	return load(lookupWithFallback(os.Getenv, dotEnv))
}

func (c Config) MySQLDSN() string {
	cfg := mysql.NewConfig()
	cfg.User = c.DBUsername
	cfg.Passwd = c.DBPassword
	cfg.Net = "tcp"
	cfg.Addr = net.JoinHostPort(c.DBHost, c.DBPort)
	cfg.DBName = c.DBName
	cfg.ParseTime = true
	return cfg.FormatDSN()
}

type lookupFunc func(string) string

func lookupWithFallback(primary lookupFunc, fallback map[string]string) lookupFunc {
	return func(key string) string {
		if value := primary(key); value != "" {
			return value
		}
		return fallback[key]
	}
}

func load(lookup lookupFunc) (Config, error) {
	cfg := Config{
		Addr:        valueOrDefault(lookup, "ADDR", ":8080"),
		AWSRegion:   valueOrDefault(lookup, "AWS_REGION", "sa-east-1"),
		SQSQueueURL: strings.TrimSpace(lookup("SQS_QUEUE_URL")),
		SQSEndpoint: strings.TrimSpace(lookup("SQS_ENDPOINT")),
		DBUsername:  strings.TrimSpace(lookup("DB_USERNAME")),
		DBPassword:  lookup("DB_PASSWORD"),
		DBName:      strings.TrimSpace(lookup("DB_NAME")),
		DBHost:      valueOrDefault(lookup, "DB_HOST", "127.0.0.1"),
		DBPort:      valueOrDefault(lookup, "DB_PORT", "3306"),
		AdminToken:  lookup("ADMIN_TOKEN"),
	}

	var problems []string
	if cfg.SQSQueueURL == "" {
		problems = append(problems, "SQS_QUEUE_URL")
	}
	if cfg.DBUsername == "" {
		problems = append(problems, "DB_USERNAME")
	}
	if strings.TrimSpace(cfg.DBPassword) == "" {
		problems = append(problems, "DB_PASSWORD")
	}
	if cfg.DBName == "" {
		problems = append(problems, "DB_NAME")
	}

	retryLight, err := parseBool(lookup("AWS_RETRY_LIGHT"))
	if err != nil {
		problems = append(problems, err.Error())
	}
	cfg.AWSRetryLight = retryLight

	if len(problems) > 0 {
		return Config{}, fmt.Errorf("invalid configuration: %s", strings.Join(problems, "; "))
	}
	return cfg, nil
}

func valueOrDefault(lookup lookupFunc, key, fallback string) string {
	if value := strings.TrimSpace(lookup(key)); value != "" {
		return value
	}
	return fallback
}

func parseBool(value string) (bool, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "0", "false":
		return false, nil
	case "1", "true":
		return true, nil
	default:
		return false, fmt.Errorf("AWS_RETRY_LIGHT must be one of: 1, true, 0, false")
	}
}

func readDotEnv(path string) (map[string]string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("read %s: %w", path, err)
	}
	values, err := parseDotEnv(string(content))
	if err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	return values, nil
}

func parseDotEnv(content string) (map[string]string, error) {
	values := map[string]string{}
	scanner := bufio.NewScanner(strings.NewReader(content))
	lineNumber := 0
	for scanner.Scan() {
		lineNumber++
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		line = strings.TrimSpace(strings.TrimPrefix(line, "export "))

		key, value, ok := strings.Cut(line, "=")
		if !ok {
			return nil, fmt.Errorf("line %d: expected KEY=VALUE", lineNumber)
		}
		key = strings.TrimSpace(key)
		if !isEnvKey(key) {
			return nil, fmt.Errorf("line %d: invalid key %q", lineNumber, key)
		}

		parsed, err := parseDotEnvValue(strings.TrimSpace(value))
		if err != nil {
			return nil, fmt.Errorf("line %d: %w", lineNumber, err)
		}
		values[key] = parsed
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return values, nil
}

func parseDotEnvValue(value string) (string, error) {
	if value == "" {
		return "", nil
	}
	if strings.HasPrefix(value, `"`) {
		if !strings.HasSuffix(value, `"`) {
			return "", fmt.Errorf("unterminated quoted value")
		}
		parsed, err := strconv.Unquote(value)
		if err != nil {
			return "", err
		}
		return parsed, nil
	}
	if strings.HasPrefix(value, "'") {
		if !strings.HasSuffix(value, "'") {
			return "", fmt.Errorf("unterminated quoted value")
		}
		return strings.TrimSuffix(strings.TrimPrefix(value, "'"), "'"), nil
	}
	return value, nil
}

func isEnvKey(key string) bool {
	if key == "" {
		return false
	}
	for i, r := range key {
		if r == '_' || unicode.IsLetter(r) || (i > 0 && unicode.IsDigit(r)) {
			continue
		}
		return false
	}
	return true
}
