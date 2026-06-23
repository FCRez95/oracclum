package http

import (
	"errors"
	"strconv"
	"strings"
)

var errInvalidClickInput = errors.New("invalid click input")

func normalizeClickIn(in *ClickIn) error {
	in.ID = strings.TrimSpace(in.ID)
	in.ClickAuth = strings.TrimSpace(in.ClickAuth)

	if in.ID == "" || in.ClickAuth == "" {
		return errInvalidClickInput
	}

	var err error
	in.Step1, err = normalizeProgress(in.Step1)
	if err != nil {
		return err
	}
	in.Step2, err = normalizeProgress(in.Step2)
	if err != nil {
		return err
	}
	in.Step3, err = normalizeProgress(in.Step3)
	if err != nil {
		return err
	}
	in.Checkout, err = normalizeProgress(in.Checkout)
	if err != nil {
		return err
	}

	return nil
}

func normalizeProgress(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", nil
	}

	n, err := strconv.Atoi(value)
	if err != nil || n < 0 {
		return "", errInvalidClickInput
	}
	return value, nil
}
