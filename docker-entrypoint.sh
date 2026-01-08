#!/bin/sh
set -eu

OUT=/usr/share/nginx/html/runtime-config.js
TEMPLATE=/usr/share/nginx/html/runtime-config.js.template

: "${VITE_SUPABASE_URL:=}"
: "${VITE_SUPABASE_ANON_KEY:=}"
: "${VITE_CURRENCYLAYER_API_KEY:=}"
: "${ALLOW_EMPTY_RUNTIME:=0}"
export VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_CURRENCYLAYER_API_KEY ALLOW_EMPTY_RUNTIME

# Helper to check if runtime-config.js exists and contains non-empty required values
runtime_valid() {
  if [ -f "$OUT" ]; then
    # quick check: ensure that SUPABASE URL and ANON key are present and not placeholders
    if grep -q 'VITE_SUPABASE_URL' "$OUT" && ! grep -q '\${' "$OUT"; then
      # extract values and ensure non-empty
      url=$(sed -n 's/.*VITE_SUPABASE_URL:\s*"\(.*\)".*/\1/p' "$OUT" | tr -d '\r')
      anon=$(sed -n 's/.*VITE_SUPABASE_ANON_KEY:\s*"\(.*\)".*/\1/p' "$OUT" | tr -d '\r')
      currency=$(sed -n 's/.*VITE_CURRENCYLAYER_API_KEY:\s*"\(.*\)".*/\1/p' "$OUT" | tr -d '\r' || true)
      if [ -n "$url" ] && [ -n "$anon" ]; then
        # currency may be optional, but if it's expected, check it too; return success if URL+ANON present
        return 0
      fi
    fi
  fi
  return 1
}

# If runtime-config.js already present and valid, AND no runtime VITE_* envs were provided to container, skip generation
if runtime_valid && [ -z "$VITE_SUPABASE_URL" ] && [ -z "$VITE_SUPABASE_ANON_KEY" ] && [ -z "$VITE_CURRENCYLAYER_API_KEY" ]; then
  echo "runtime-config.js already present and valid, skipping generation"
else
  # If template exists, prefer rendering from it (envsubst will replace with env or empty)
  if [ -f "$TEMPLATE" ]; then
    echo "Rendering runtime configuration from template $TEMPLATE..."
    envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_ANON_KEY} ${VITE_CURRENCYLAYER_API_KEY}' < "$TEMPLATE" > "$OUT"
    echo "Wrote $OUT from template"
  else
    # If build-time variables provided (embedded in image) or runtime env provided, generate
    if [ -n "$VITE_SUPABASE_URL" ] || [ -n "$VITE_SUPABASE_ANON_KEY" ] || [ -n "$VITE_CURRENCYLAYER_API_KEY" ]; then
      echo "Generating runtime-config.js from environment variables..."
      printf 'window.__RUNTIME__ = {\n  VITE_SUPABASE_URL: "%s",\n  VITE_SUPABASE_ANON_KEY: "%s",\n  VITE_CURRENCYLAYER_API_KEY: "%s"\n}\n' "$VITE_SUPABASE_URL" "$VITE_SUPABASE_ANON_KEY" "$VITE_CURRENCYLAYER_API_KEY" > "$OUT"
      echo "Wrote $OUT from environment"
    else
      echo "No template and no VITE_* env vars, leaving runtime-config.js as-is (if present) or empty"
    fi
  fi
fi

# If runtime is required, validate (unless ALLOW_EMPTY_RUNTIME=1)
if [ "${ALLOW_EMPTY_RUNTIME}" != "1" ]; then
  if ! runtime_valid; then
    echo "ERROR: runtime-config.js is missing or invalid. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (and optional VITE_CURRENCYLAYER_API_KEY) either as build-args (recommended for image) or as runtime envs (via --env-file)" >&2
    [ -f "$OUT" ] && echo "---- current runtime-config.js ----" >&2 && cat "$OUT" >&2
    exit 1
  fi
fi

exec "$@"
