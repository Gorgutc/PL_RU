# DO NOT PUSH

Files in this list must never be committed or pushed.

## Secrets / credentials

- `.env`, `.env.local`, `.env.*.local`
- Any credential file with `secret`, `credentials`, `token`, `tokens`,
  `api_key`, `private_key` in the name. Approved design-token/reference files
  such as `src/styles/_tokens.scss`, `Blueprints_lib/`, and
  `Osiris_ref/.env.example` are excluded from the quick grep below.
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
git ls-files | grep -iE '(^|/)\.env($|\.local$|\..*\.local$)|secret|credentials?|refresh[-_]?token|access[-_]?token|id[-_]?token|auth[-_]?token|(^|[._/-])tokens?([._/-]|$)|api[_-]?key|private[_-]?key' | grep -viE '^(Blueprints_lib/|Osiris_ref/\.env\.example$|src/styles/_tokens\.scss$)' && echo "STOP" || echo "ok"
```

If you find a secret in history: **rotate the secret first**, then rewrite history with `git filter-repo`. Never just delete the file — git keeps the old blob.
