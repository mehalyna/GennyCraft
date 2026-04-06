#!/bin/bash

INPUT=$(cat)

# Extract fields from JSON input
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
SOURCE=$(echo "$INPUT" | jq -r '.source // "unknown"')
INITIAL_PROMPT=$(echo "$INPUT" | jq -r '.initialPrompt // ""')
USER="${USER:-unknown}"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure logs directory exists
mkdir -p logs

# Redact sensitive patterns from initial prompt
REDACTED_PROMPT=$(echo "$INITIAL_PROMPT" | \
  sed -E 's/ghp_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/Bearer [A-Za-z0-9_\-\.]+/Bearer [REDACTED]/g' | \
  sed -E 's/--password[= ][^ ]+/--password=[REDACTED]/g' | \
  sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/[REDACTED_EMAIL]/g')

# Append to audit log as JSONL
jq -n \
  --arg event "sessionStart" \
  --arg date "$DATE" \
  --arg ts "$TIMESTAMP" \
  --arg user "$USER" \
  --arg cwd "$CWD" \
  --arg source "$SOURCE" \
  --arg prompt "$REDACTED_PROMPT" \
  '{
    event: $event,
    date: $date,
    timestamp: $ts,
    user: $user,
    cwd: $cwd,
    source: $source,
    initialPrompt: $prompt
  }' >> logs/copilot-audit.jsonl

# Also write a human-readable line to session log
echo "[$DATE] SESSION STARTED | user=$USER | source=$SOURCE | cwd=$CWD" \
  >> logs/session.log

exit 0