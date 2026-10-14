# RicoDoesIt BTC paper runner

This minimal Render cron caller evaluates the owner-private RicoDoesIt BTC/USD Lab's deterministic paper-only rule engine. It never contacts a broker and contains no credentials.

## Render configuration

- Runtime: Node
- Schedule: `* * * * *` (UTC)
- Build command: `npm install --ignore-scripts --no-audit --no-fund`
- Start command: `npm start`
- Secrets: `LAB_SITE_URL`, `SITES_SERVICE_TOKEN`, `LAB_RUNNER_SECRET`

Every successful run must log `paper_check_verified` and create a matching D1 `auto_runner_checks` row. Five consecutive matching runs are required before calling unattended evaluation verified.
