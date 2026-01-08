#!/bin/sh
set -eu

OUT=/usr/share/nginx/html/runtime-config.js
# Шаблон ожидаем в этом пути внутри nginx-публичной папки после сборки
TEMPLATE1=/usr/share/nginx/html/runtime-config.js.template
# Запасной вариант — шаблон в рабочей директории контейнера (например при локальном запуске)
TEMPLATE2=./runtime-config.js.template

# Подготовим переменные (разрешаем пустые значения)
: "${VITE_SUPABASE_URL:=}"
: "${VITE_SUPABASE_ANON_KEY:=}"
: "${VITE_CURRENCYLAYER_API_KEY:=}"
export VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_CURRENCYLAYER_API_KEY

render_template() {
  TEMPLATE_PATH="$1"
  if [ -f "$TEMPLATE_PATH" ]; then
    echo "Rendering runtime configuration from template $TEMPLATE_PATH..."
    # Подставляем только ожидаемые переменные, чтобы не инжектить лишнее
    envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_ANON_KEY} ${VITE_CURRENCYLAYER_API_KEY}' < "$TEMPLATE_PATH" > "$OUT"
    echo "Wrote $OUT"
    return 0
  fi
  return 1
}

if render_template "$TEMPLATE1"; then
  :
elif render_template "$TEMPLATE2"; then
  :
else
  echo "Template runtime-config.js.template not found in $TEMPLATE1 or $TEMPLATE2, skipping runtime config rendering"
fi

# Exec the main command (nginx)
exec "$@"
