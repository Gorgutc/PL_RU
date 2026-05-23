#!/usr/bin/env bash
# sync-refs.sh — SessionStart hook for the TS frontend starter.
#
# Reference folders (Blueprints_lib, Osiris_ref) are committed inside this
# repo as READ-ONLY content. There is nothing to `git pull` — they are not
# separate clones in this layout. This script:
#   1. asserts both reference folders are present,
#   2. records a baseline manifest (file count + hash sample) so the Stop
#      hook can detect any drift introduced during the session,
#   3. prints a one-line reminder of what each ref is for.
#
# Exit non-zero only if a reference folder is missing — that is a real
# problem (the harness lost state). Drift is reported by verify-reference.js.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REFS=(Blueprints_lib Osiris_ref)
STATE_DIR="$ROOT/.claude/.refs-baseline"
mkdir -p "$STATE_DIR"

echo "[sync-refs] root=$ROOT"

for ref in "${REFS[@]}"; do
  if [ ! -d "$ROOT/$ref" ]; then
    echo "[sync-refs] FAIL: reference folder missing: $ref"
    exit 1
  fi
  count=$(find "$ROOT/$ref" -type f \! -path '*/.git/*' | wc -l | tr -d ' ')
  # Sample-hash: deterministic but cheap. Hash the sorted list of relpaths
  # + sizes; we are not trying to be cryptographic, just to spot edits.
  baseline=$(cd "$ROOT/$ref" && find . -type f \! -path './.git/*' -printf '%p %s\n' 2>/dev/null \
    | LC_ALL=C sort | sha256sum | awk '{print $1}')
  printf '%s\n' "$baseline" > "$STATE_DIR/$ref.sha256"
  echo "[sync-refs] $ref: $count files, baseline=${baseline:0:12}"
done

cat <<'EOF'
[sync-refs] READ-ONLY references:
  Blueprints_lib  — Palantir Blueprint monorepo (components & tokens reference).
                    Check packages/core, packages/icons, llms.txt before generating.
  Osiris_ref      — Next.js 16 OSINT dashboard (layout & motion reference).
                    Check src/components, src/app for HUD / panel patterns.
  Never edit either folder. Use them as read-only design references only.
EOF
