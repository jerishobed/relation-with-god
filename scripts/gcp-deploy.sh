#!/usr/bin/env bash
set -e

# ==============================================================================
# RELATION WITH GOD - GCP CLOUD RUN SAFE DEPLOYMENT SCRIPT
# ==============================================================================
# SAFETY GUARD: Prevents touching or modifying any pre-existing GCP projects!
# ==============================================================================

BLACK_LISTED_PROJECTS=(
  "personal-gemini-journal-fcc28"
  "coffee-shop-agent-506604"
  "confident-topic-242908"
  "gen-lang-client-0518043060"
  "gopika-5bb19"
  "h2020-1578669704990"
  "jerish-51bd7"
  "project-52ca2287-ab09-4b2d-ac6"
  "uber-243502"
)

DEFAULT_NEW_PROJECT="relation-with-god-365"
REGION="asia-south1"
SERVICE_NAME="relation-with-god-web"

echo "============================================================"
echo "   RELATION WITH GOD - SAFE GCP DEPLOYMENT"
echo "============================================================"

TARGET_PROJECT="${1:-$DEFAULT_NEW_PROJECT}"

# 1. Check blacklist
for blocked in "${BLACK_LISTED_PROJECTS[@]}"; do
  if [ "$TARGET_PROJECT" == "$blocked" ]; then
    echo ""
    echo "❌ ERROR: SAFETY GUARD TRIGGERED!"
    echo "Project '$TARGET_PROJECT' is one of your pre-existing projects."
    echo "Deployment was ABORTED to preserve all your existing GCP data."
    echo "Please specify a NEW dedicated project ID (e.g. relation-with-god-365)."
    echo ""
    exit 1
  fi
done

echo "✅ Safety Check Passed: '$TARGET_PROJECT' is NOT in the blocked list."
echo ""
echo "Target Project ID: $TARGET_PROJECT"
echo "Target Region:    $REGION"
echo "Cloud Run Service: $SERVICE_NAME"
echo ""

# Check if project exists or needs to be created
if ! gcloud projects describe "$TARGET_PROJECT" >/dev/null 2>&1; then
  echo "Project '$TARGET_PROJECT' does not exist yet."
  echo "Creating new GCP project '$TARGET_PROJECT'..."
  gcloud projects create "$TARGET_PROJECT" --name="Relation With God"
  
  echo "Linking billing account..."
  BILLING_ACCOUNT=$(gcloud billing accounts list --filter="open=true" --format="value(name)" | head -n 1)
  if [ -n "$BILLING_ACCOUNT" ]; then
    gcloud billing projects link "$TARGET_PROJECT" --billing-account="$BILLING_ACCOUNT"
    echo "Linked to billing account: $BILLING_ACCOUNT"
  fi
fi

echo "Setting active configuration to new project..."
gcloud config set project "$TARGET_PROJECT"

echo "Enabling necessary GCP APIs (Cloud Run, Cloud Build, Artifact Registry)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo "Building and deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

echo ""
echo "============================================================"
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "Relation With God is live on GCP Cloud Run."
echo "============================================================"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)"
