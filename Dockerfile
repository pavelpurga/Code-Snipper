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

# Build args for embedding runtime config at build time (optional)
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_CURRENCYLAYER_API_KEY=""

# Install envsubst (gettext) for optional runtime templating
RUN apk add --no-cache gettext

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# If build args provided, generate runtime-config.js at build time so the image is runnable
RUN if [ -n "${VITE_SUPABASE_URL}" ] || [ -n "${VITE_SUPABASE_ANON_KEY}" ]; then \
  printf 'window.__RUNTIME__ = {\n  VITE_SUPABASE_URL: "%s",\n  VITE_SUPABASE_ANON_KEY: "%s",\n  VITE_CURRENCYLAYER_API_KEY: "%s"\n}\n' "${VITE_SUPABASE_URL}" "${VITE_SUPABASE_ANON_KEY}" "${VITE_CURRENCYLAYER_API_KEY}" > /usr/share/nginx/html/runtime-config.js; \
  echo "Created runtime-config.js at build time"; \
fi

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 80

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
 CMD wget -qO- http://localhost/ || exit 1

# Start nginx via entrypoint which injects runtime envs if needed
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
