#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install --upgrade pip
pip install requests beautifulsoup4

mkdir -p assets/data/raw
mkdir -p assets/data/normalized
mkdir -p scraper_output

echo "==> 1/5 scraper_7dso_v2.py"
python3 scraper_7dso_v2.py

echo "==> 2/5 scraper_details.py"
python3 scraper_details.py

echo "==> 3/5 scraper_full.py"
python3 scraper_full.py

echo "==> 4/5 scraper_final.py"
python3 scraper_final.py

echo "==> 5/5 build_builder_data.py"
python3 build_builder_data.py

echo "OK - pipeline builder terminé"