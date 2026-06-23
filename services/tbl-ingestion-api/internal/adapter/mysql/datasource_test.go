package mysql

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestGetCampaignMapSuccess(t *testing.T) {
	db := openCampaignTestDB(t, &campaignTestDriver{
		rows: [][]driver.Value{
			{"campaign-1", "token-1"},
			{"campaign-2", "token-2"},
		},
	})
	defer db.Close()

	got, err := GetCampaignMap(context.Background(), db)
	if err != nil {
		t.Fatalf("get campaign map: %v", err)
	}

	want := map[string]string{
		"token-1": "campaign-1",
		"token-2": "campaign-2",
	}
	if !equalMaps(got, want) {
		t.Fatalf("unexpected campaign map: got %+v want %+v", got, want)
	}
}

func TestGetCampaignMapReturnsQueryError(t *testing.T) {
	queryErr := errors.New("query failed")
	db := openCampaignTestDB(t, &campaignTestDriver{queryErr: queryErr})
	defer db.Close()

	_, err := GetCampaignMap(context.Background(), db)
	if !errors.Is(err, queryErr) {
		t.Fatalf("expected query error, got %v", err)
	}
}

func TestGetCampaignMapReturnsScanError(t *testing.T) {
	db := openCampaignTestDB(t, &campaignTestDriver{
		rows: [][]driver.Value{
			{"campaign-1", nil},
		},
	})
	defer db.Close()

	_, err := GetCampaignMap(context.Background(), db)
	if err == nil {
		t.Fatal("expected scan error")
	}
}

func TestGetCampaignMapReturnsRowsError(t *testing.T) {
	rowsErr := errors.New("rows failed")
	db := openCampaignTestDB(t, &campaignTestDriver{rowsErr: rowsErr})
	defer db.Close()

	_, err := GetCampaignMap(context.Background(), db)
	if !errors.Is(err, rowsErr) {
		t.Fatalf("expected rows error, got %v", err)
	}
}

type campaignTestDriver struct {
	queryErr error
	rows     [][]driver.Value
	rowsErr  error
}

func (d *campaignTestDriver) Open(_ string) (driver.Conn, error) {
	return &campaignTestConn{driver: d}, nil
}

type campaignTestConn struct {
	driver *campaignTestDriver
}

func (c *campaignTestConn) Prepare(_ string) (driver.Stmt, error) {
	return nil, errors.New("prepare not implemented")
}

func (c *campaignTestConn) Close() error {
	return nil
}

func (c *campaignTestConn) Begin() (driver.Tx, error) {
	return nil, errors.New("transactions not implemented")
}

func (c *campaignTestConn) QueryContext(_ context.Context, query string, _ []driver.NamedValue) (driver.Rows, error) {
	if strings.TrimSpace(query) != "SELECT id, click_auth FROM campaigns" {
		return nil, fmt.Errorf("unexpected query: %s", query)
	}
	if c.driver.queryErr != nil {
		return nil, c.driver.queryErr
	}
	return &campaignTestRows{
		rows:    c.driver.rows,
		rowsErr: c.driver.rowsErr,
	}, nil
}

type campaignTestRows struct {
	rows    [][]driver.Value
	rowsErr error
	idx     int
}

func (r *campaignTestRows) Columns() []string {
	return []string{"id", "click_auth"}
}

func (r *campaignTestRows) Close() error {
	return nil
}

func (r *campaignTestRows) Next(dest []driver.Value) error {
	if r.idx < len(r.rows) {
		copy(dest, r.rows[r.idx])
		r.idx++
		return nil
	}
	if r.rowsErr != nil {
		err := r.rowsErr
		r.rowsErr = nil
		return err
	}
	return io.EOF
}

func openCampaignTestDB(t *testing.T, d *campaignTestDriver) *sql.DB {
	t.Helper()

	driverName := "campaign-test-" + strconv.FormatInt(time.Now().UnixNano(), 10)
	sql.Register(driverName, d)

	db, err := sql.Open(driverName, "")
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	return db
}

func equalMaps(a, b map[string]string) bool {
	if len(a) != len(b) {
		return false
	}
	for k, v := range a {
		if b[k] != v {
			return false
		}
	}
	return true
}
