#!/usr/bin/env bash
# sync-refs.sh — SessionStart hook for the TS frontend starter.
#
# Reference folders are committed inside this repo as READ-ONLY content.
# There is nothing to `git pull` — they are not separate clones in this layout.
# This script:
#   1. asserts every reference folder is present,
#   2. records a baseline manifest (file count + hash sample) so the Stop
#      hook can detect any drift introduced during the session,
#   3. prints a one-line reminder of what each ref is for.
#
# Reference folders are of two kinds:
#   - top-level reference clones:        Blueprints_lib, Osiris_ref
#   - design-system agent skills:        .claude/skills/<name>/    (auto-discovered)
#
# Adding a new skill is zero-config: drop the folder under .claude/skills/
# and it is picked up on the next session start.
#
# Exit non-zero only if a reference folder is missing — that is a real
# problem (the harness lost state). Drift is reported by verify-reference.js.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="$ROOT/.claude/.refs-baseline"
mkdir -p "$STATE_DIR"

echo "[sync-refs] root=$ROOT"

# Static refs at repo root.
REFS=(Blueprints_lib Osiris_ref)

# Auto-discover any .claude/skills/<name>/ dirs and treat them the same.
if [ -d "$ROOT/.claude/skills" ]; then
  while IFS= read -r d; do
    REFS+=(".claude/skills/$(basename "$d")")
  done < <(find "$ROOT/.claude/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | LC_ALL=C sort)
fi

for ref in "${REFS[@]}"; do
  if [ ! -d "$ROOT/$ref" ]; then
    echo "[sync-refs] FAIL: reference folder missing: $ref"
    exit 1
  fi
  count=$(find "$ROOT/$ref" -type f \! -path '*/.git/*' | wc -l | tr -d ' ')
  # Sample-hash: deterministic but cheap. Hash the sorted list of relpaths
  # + sizes; we are not trying to be cryptographic, just to spot edits.
  # Slashes in the ref name become dashes in the state-file name so we can
  # write a flat directory.
  state_name=$(echo "$ref" | tr '/' '-')
  baseline=$(cd "$ROOT/$ref" && find . -type f \! -path './.git/*' -printf '%p %s\n' 2>/dev/null \
    | LC_ALL=C sort | sha256sum | awk '{print $1}')
  printf '%s\n' "$baseline" > "$STATE_DIR/$state_name.sha256"
  echo "[sync-refs] $ref: $count files, baseline=${baseline:0:12}"
done

cat <<'EOF'
[sync-refs] READ-ONLY references:
  Blueprints_lib              — Palantir Blueprint monorepo (component & token reference).
                                Check packages/core, packages/icons, llms.txt before generating.
  Osiris_ref                  — Next.js 16 OSINT dashboard (layout & motion reference).
                                Check src/components, src/app for HUD / panel patterns.
  .claude/skills/<name>/      — Agent Skills (design systems). User-invocable via `/<name>`.
                                Read SKILL.md + README.md before borrowing brand vocabulary.
  Never edit any of these. Use them as read-only design references only.
EOF
