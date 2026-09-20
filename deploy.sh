#!/usr/bin/env bash
set -euo pipefail

# Deploys Stein Hoist Trainer (static Vite build) to mampersat.com/steinhoist/.
S3_PATH="s3://mampersat.com/steinhoist/"
CLOUDFRONT_DISTRIBUTION_ID="E1GFON8TFLZUQB"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

npm run build

aws s3 sync dist/ "$S3_PATH" \
  --acl public-read \
  --delete \
  --cache-control "no-cache"

echo "Deployed to https://mampersat.com/steinhoist/"

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/steinhoist/*" >/dev/null

echo "Invalidated CloudFront cache for /steinhoist/*"
