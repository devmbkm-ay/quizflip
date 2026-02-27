# GCP Deployment Guide (Dev + Prod Separation, No Custom Domain)

This guide deploys:
- Backend API: Cloud Run
- Frontend: Cloud Storage static hosting
- CI/CD: Cloud Build triggers by branch
- Secrets: Secret Manager

It is designed for strict separation between development and production.

## 1) Environment Separation Model

Use two distinct GCP projects:
- `quizflip-dev` for development
- `quizflip-prod` for production

Use separate resources in each project:
- Artifact Registry repos
- Cloud Run services
- Cloud Storage buckets
- Secret Manager secrets
- MongoDB database users/URIs

## 2) Prerequisites

- `gcloud` CLI installed and authenticated
- Billing enabled on both projects
- Existing MongoDB Atlas clusters (or databases) for dev/prod
- Secret values rotated (JWT, Google API key, Mongo URI)

## 3) One-Time Setup Per Project

Run the following once in `quizflip-dev`, then repeat in `quizflip-prod`.

```bash
gcloud config set project <PROJECT_ID>

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com

# Artifact Registry for backend images
gcloud artifacts repositories create quizflip \
  --repository-format=docker \
  --location=us-central1 \
  --description="Quizflip images"

# Frontend bucket (must be globally unique)
gcloud storage buckets create gs://<BUCKET_NAME> --location=us-central1

gcloud storage buckets update gs://<BUCKET_NAME> --web-main-page-suffix=index.html --web-error-page=404.html

# Allow public read for static site
# (only for frontend bucket, never for secrets or backend)
gsutil iam ch allUsers:objectViewer gs://<BUCKET_NAME>
```

Website URL format (no custom domain):
- `https://storage.googleapis.com/<BUCKET_NAME>/index.html`

## 4) Create Secrets Per Project

Create these three secrets in each project:
- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_API_KEY`

```bash
echo -n "<MONGODB_URI_VALUE>" | gcloud secrets create MONGODB_URI --data-file=-
echo -n "<JWT_SECRET_VALUE>" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "<GOOGLE_API_KEY_VALUE>" | gcloud secrets create GOOGLE_API_KEY --data-file=-
```

If already created, add a new version:

```bash
echo -n "<NEW_VALUE>" | gcloud secrets versions add MONGODB_URI --data-file=-
```

## 5) Deploy Backend Manually (First Deployment)

Use project-specific values.

```bash
gcloud config set project <PROJECT_ID>

gcloud builds submit . --config cloudbuild/backend.<env>.yaml \
  --substitutions=_REGION=us-central1,_REPOSITORY=quizflip,_SERVICE=quizflip-api-<env>,_CORS_ORIGIN=<FRONTEND_URL>
```

Notes:
- `<env>` is `dev` or `prod`
- `<FRONTEND_URL>` is your bucket URL root, for example:
  - `https://storage.googleapis.com/<BUCKET_NAME>`

Get the API URL:

```bash
gcloud run services describe quizflip-api-<env> --region us-central1 --format='value(status.url)'
```

## 6) Deploy Frontend Manually (First Deployment)

Use the API URL returned above.

```bash
gcloud config set project <PROJECT_ID>

gcloud builds submit . --config cloudbuild/frontend.<env>.yaml \
  --substitutions=_API_BASE_URL=<CLOUD_RUN_URL>/api,_BUCKET_NAME=<BUCKET_NAME>
```

Then open:
- `https://storage.googleapis.com/<BUCKET_NAME>/index.html`

## 7) Create Cloud Build Triggers (Branch Separation)

Recommended mapping:
- `development` branch -> dev backend + dev frontend configs
- `main` branch -> prod backend + prod frontend configs

Create triggers in each project UI or CLI:
- Dev project triggers use:
  - `cloudbuild/backend.dev.yaml`
  - `cloudbuild/frontend.dev.yaml`
- Prod project triggers use:
  - `cloudbuild/backend.prod.yaml`
  - `cloudbuild/frontend.prod.yaml`

## 8) Security Baseline (No Custom Domain)

1. Keep `CORS_ORIGIN` strict per environment URL.
2. Never commit real secrets in `.env` files.
3. Use only Secret Manager for production values.
4. Use separate Mongo users for dev and prod.
5. Keep production `min-instances=1` to reduce cold starts.
6. Grant least-privilege IAM to Cloud Build and Cloud Run SAs.

## 9) Optional Hardening Next

- Put Cloud Run behind HTTPS Load Balancer + Cloud Armor.
- Disable direct `run.app` URL after load balancer is in place.
- Add uptime checks and alerting for `/api/health`.

## 10) Files Added for This Setup

- `server/Dockerfile.prod`
- `cloudbuild/backend.dev.yaml`
- `cloudbuild/backend.prod.yaml`
- `cloudbuild/frontend.dev.yaml`
- `cloudbuild/frontend.prod.yaml`

