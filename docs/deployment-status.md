# Deployment Status

- **Branch**: `work` (latest commit `1a857f1`) is not the production target. Push or merge to `main` to trigger production deployment.
- **Workflow**: `.github/workflows/codex-deploy.yml` now handles production deploys for `main` with Vercel CLI using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets.
- **Remotes**: No git remotes are configured in this workspace; add `origin` (`https://github.com/battaglia-v/mk-language-lab.git`) and push `work` to `main` to publish the latest changes.

Based on the current repository state, the latest changes have **not** been deployed to production until they reach the `main` branch and the new workflow runs successfully.
