# speed.skk.moe

Browser speed test: download, upload, latency and jitter.

## Development

```bash
pnpm install
pnpm run dev
```

Test targets come from `SPEEDTEST_TARGETS`. Copy `.env.example` to `.env` and fill in the endpoints; the same variable is set in the Cloudflare Pages build environment.
