#!/bin/sh
set -e

# Default values if not provided (keeps blank strings to avoid literal 'undefined')
: "${VITE_SUPABASE_URL:=}"
: "${VITE_SUPABASE_ANON_KEY:=}"

TEMPLATE=/usr/share/nginx/html/runtime-config.js.template
OUT=/usr/share/nginx/html/runtime-config.js

if [ -f "$TEMPLATE" ]; then
  echo "Rendering runtime configuration from template..."
  envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_ANON_KEY}' < "$TEMPLATE" > "$OUT"
  echo "Wrote runtime config to $OUT"
else
  echo "No runtime template found at $TEMPLATE"
fi

# Execute the CMD
exec "$@"

