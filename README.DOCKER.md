# Docker build & GitHub Actions deploy (code-snipper)

This project already contains a multi-stage `Dockerfile` suitable for building a Vite React app and serving static files with Nginx.

This README explains how to use the existing `Dockerfile` locally and how to wire GitHub Actions to build and push the image to GHCR and deploy to a remote host.

---

## Local build and run

Build locally:

```powershell
# build image locally (PowerShell)
docker build -t code-snipper:local .

docker run --rm -p 8080:80 code-snipper:local
```

Open http://localhost:8080 to verify the app.

## Requirements for CI deploy

1. Add the following repository secrets (GitHub > Settings > Secrets > Actions):
   - `IMAGE_NAME` — full image name, e.g. `ghcr.io/<owner>/code-snipper`
   - `DEPLOY_SSH_PRIVATE_KEY` — optional, private SSH key for remote deploy
   - `DEPLOY_HOST` — optional, remote host IP/name
   - `DEPLOY_USER` — optional, remote SSH user
   - `DEPLOY_SSH_PORT` — optional, default 22
   - `CONTAINER_NAME` — optional, default `code-snipper`

2. The workflow `.github/workflows/docker-deploy.yml` will:
   - Build the Docker image using the `Dockerfile` on `main/master` push
   - Tag the image with commit SHA and `latest` and push to GHCR (using `GITHUB_TOKEN`)
   - Optionally SSH to a `DEPLOY_HOST` and run/replace the container

## Server setup

On the target host make sure:
- Docker is installed and the user (DEPLOY_USER) can run `docker` commands (or use sudo in the SSH command)
- Port 80 is free or properly reverse-proxied
- If deploying behind HTTPS or a domain, configure TLS/reverse proxy

## Notes
- The Docker image uses Nginx to serve built `dist` folder. The `Dockerfile` expects `npm run build` to output to `dist`.
- If your build outputs to a different folder (e.g. `build`), update the `Dockerfile` COPY path.
- For private registry (GHCR) the Action logs into ghcr.io using `GITHUB_TOKEN`.

---

If you want, I can also:
- Add `docker-compose.yml` for local and production deployments.
- Add a healthcheck endpoint to the app and update `Dockerfile` accordingly.
- Add additional GitHub Actions job to clean old images in GHCR.

