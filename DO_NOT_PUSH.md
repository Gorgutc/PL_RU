# DO NOT PUSH

Files in this list must never be committed or pushed.

## Secrets / credentials

- `.env`, `.env.local`, `.env.*.local`
- Any file with `secret`, `credentials`, `token`, `api_key`, `private_key` in the name
- Any `.pem`, `.p12`, `.pfx`, `.crt`, `.key` outside `node_modules/`

## Personal / local

- `*.local` anywhere
- `scratch/`, `notes.private.md`, `*.scratch.*`
- Root-level `codex_*.md` work logs and briefs
- Editor scratchpads

## Large binaries / build artifacts

- `.next/`, `out/`, `dist/`, `build/`
- `coverage/`, `playwright-report/`, `test-results/`
- `.lighthouseci/`, `jscpd-report/`, `reports/`
- `.codex-refs-baseline/`, `.claude/.refs-baseline/`
- `*.log`
- `*.tsbuildinfo`

## How to verify before push

```bash
git status              # nothing in this list should appear
git ls-files | grep -iE '\.env|secret|credential|token|private_key' && echo "STOP" || echo "ok"
```

If you find a secret in history: **rotate the secret first**, then rewrite history with `git filter-repo`. Never just delete the file — git keeps the old blob.
