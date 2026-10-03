# Rico BTC paper minute caller

This tiny repository is intended to be mirrored into a private GitHub/GitLab/Bitbucket repository for one Render cron service. It contains no trading credentials, no database access, and no broker integration.

- Runtime: Node 22+, no dependencies; build command `npm install --omit=dev`, start command `npm start`.
- Schedule: `* * * * *` in UTC. At most one active Render cron invocation at a time.
- Configure `LAB_SITE_URL`, `SITES_SERVICE_TOKEN`, and `LAB_RUNNER_SECRET` in Render service settings. Use the exact private Site URL, the Site's platform service credential, and a separate 32+ character random secret shared with the Site's `LAB_RUNNER_SECRET` secret setting. Never commit or print values.
- Each run POSTs to the private Site's `/api/auto/service`, exits nonzero on missing data, a failed claim, or HTTP errors, and logs only time, venue, and status. The Site records a bounded D1 `auto_runner_checks` row; `verified` means the route claimed a recent evaluation and returned a fresh same-venue quote.
- Keep the browser's Pause/Close controls. The shared D1 claim prevents duplicate evaluation slots. The service caller cannot directly alter a trade or call a broker.
- Verify five consecutive Render scheduled logs and matching `verified` D1 rows while no Market browser evaluation requests appear. This is evidence of a sampled run window, not a continuous uptime guarantee.
