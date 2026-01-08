# Multi-stage build for Vite React app

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy sources
COPY . .

# Build
RUN npm run build

# 2) Runtime stage (Nginx)
FROM nginx:alpine AS runner

# Install envsubst (gettext) for runtime templating
RUN apk add --no-cache gettext

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Create runtime-config.js.template with placeholders (will be rendered by entrypoint)
RUN cat > /usr/share/nginx/html/runtime-config.js <<'EOF'
window.__RUNTIME__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_CURRENCYLAYER_API_KEY: "${VITE_CURRENCYLAYER_API_KEY}"
}
EOF

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 80

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
 CMD wget -qO- http://localhost/ || exit 1

# Start nginx via entrypoint which injects runtime envs
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
