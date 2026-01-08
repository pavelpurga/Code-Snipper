#!/bin/sh
set -eu

TEMPLATE=/usr/share/nginx/html/runtime-config.js.template
OUT=/usr/share/nginx/html/runtime-config.js

if [ -f "$TEMPLATE" ]; then
  echo "Rendering runtime configuration from template..."
  # ensure variables exist (allow empty fallback)
  : "${VITE_SUPABASE_URL:=}"
  : "${VITE_SUPABASE_ANON_KEY:=}"
  : "${VITE_CURRENCYLAYER_API_KEY:=}"
  export VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_CURRENCYLAYER_API_KEY

  # Substitute only the variables we expect to avoid injecting unwanted values
  envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_ANON_KEY} ${VITE_CURRENCYLAYER_API_KEY}' < "$TEMPLATE" > "$OUT"
  echo "Wrote $OUT"
else
  echo "Template $TEMPLATE not found, skipping runtime config rendering"
fi

# Exec the main command (nginx)
exec "$@"
