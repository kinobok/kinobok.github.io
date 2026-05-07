# Design Spec: Workflow Trigger Fix for Automatic Deployment

Currently, the `deploy.yml` workflow does not trigger when `daily-scraper.yml` pushes changes to `frontend/public/data.json` because GitHub Actions prevents workflows triggered by `GITHUB_TOKEN` from triggering other workflows.

## Goals
- Automatically trigger `deploy.yml` whenever `daily-scraper.yml` completes successfully.
- Maintain existing triggers for manual pushes and `workflow_dispatch`.
- Ensure no deployment happens if the scraper fails.

## Proposed Solution: `workflow_run`
We will use the GitHub Actions `workflow_run` event to chain the deployment to the scraper's completion.

### Architecture

#### 1. Updated Trigger Logic in `deploy.yml`
We will add the `workflow_run` event to the `on` block of `deploy.yml`.

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'
  workflow_run:
    workflows: ["Daily Warsaw Scraper"]
    types:
      - completed
    branches:
      - main
  workflow_dispatch:
```

#### 2. Conditional Execution
To avoid deploying on scraper failures, we will add a job-level `if` condition to the `build` job.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    if: >
      github.event_name == 'push' || 
      github.event_name == 'workflow_dispatch' || 
      (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success')
    # ... rest of the job
```

### Data Flow
1. `daily-scraper.yml` runs on a schedule (4:00 AM UTC).
2. It pushes a commit to `main` with updated `data.json`.
3. GitHub emits a `workflow_run` (completed) event for "Daily Warsaw Scraper".
4. `deploy.yml` receives this event.
5. The `if` condition in `deploy.yml` evaluates to `true` if the scraper succeeded.
6. `deploy.yml` checkouts the latest `main` (containing the new data) and proceeds with build/deploy.

### Testing Plan
- **Manual Verification:** Manually trigger `daily-scraper.yml` and observe if `deploy.yml` starts automatically after completion.
- **Regression Testing:** Push a manual change to `frontend/` to ensure it still triggers via the `push` event.
- **Negative Testing:** (Optional/Simulated) If the scraper fails, verify that `deploy.yml` either doesn't start or skips its jobs.
