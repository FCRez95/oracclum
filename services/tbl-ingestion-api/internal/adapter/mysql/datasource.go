package mysql

import (
	"context"
	"database/sql"
)

type Campaign struct {
	ID        string
	ClickAuth string
}

func GetCampaignMap(ctx context.Context, db *sql.DB) (map[string]string, error) {
	rows, err := db.QueryContext(ctx, "SELECT id, click_auth FROM campaigns")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	campaignMap := make(map[string]string)
	for rows.Next() {
		var c Campaign
		if err := rows.Scan(&c.ID, &c.ClickAuth); err != nil {
			return nil, err
		}
		campaignMap[c.ClickAuth] = c.ID
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return campaignMap, nil
}
