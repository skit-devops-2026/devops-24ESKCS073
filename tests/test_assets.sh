#!/usr/bin/env bash

set -eu

pages=(
  index.html
  add-expense.html
  budget.html
  ledger.html
  insights.html
  shared.html
)

for page in "${pages[@]}"; do
  if [[ ! -f "$page" ]]; then
    echo "FAIL: Missing page: $page"
    exit 1
  fi

  while IFS= read -r asset; do
    [[ -z "$asset" ]] && continue

    if [[ ! -f "$(dirname "$page")/$asset" ]]; then
      echo "FAIL: $page references missing asset: $asset"
      exit 1
    fi
  done < <(
    grep -Eo '(href|src)="[^"]+"' "$page" \
      | sed -E 's/^(href|src)="([^"]+)"$/\2/' \
      | grep -E '^(css/|js/)' || true
  )
done

echo "PASS: All Billbook pages and local CSS/JS references exist."
