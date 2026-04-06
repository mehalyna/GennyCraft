#!/bin/bash

INPUT=$(cat)

# Extract fields from JSON input
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp // empty')
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
USER="${USER:-unknown}"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Ensure logs directory exists
mkdir -p logs

# Redact sensitive patterns from prompt
REDACTED_PROMPT=$(echo "$PROMPT" | \
  sed -E 's/ghp_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/gho_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/ghu_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/ghs_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/Bearer [A-Za-z0-9_\-\.]+/Bearer [REDACTED]/g' | \
  sed -E 's/--password[= ][^ ]+/--password=[REDACTED]/g' | \
  sed -E 's/--token[= ][^ ]+/--token=[REDACTED]/g' | \
  sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/[REDACTED_EMAIL]/g')

# Flag sensitive keywords in prompt for review
FLAGGED=""
SENSITIVE_KEYWORDS=("password" "secret" "token" "api_key" "private_key" "credential")

for keyword in "${SENSITIVE_KEYWORDS[@]}"; do
  if echo "$PROMPT" | grep -qi "$keyword"; then
    FLAGGED="$FLAGGED $keyword"
  fi
done

FLAGGED=$(echo "$FLAGGED" | xargs) # trim whitespace

# Append to audit log as JSONL
jq -n \
  --arg event "userPromptSubmitted" \
  --arg date "$DATE" \
  --arg ts "$TIMESTAMP" \
  --arg user "$USER" \
  --arg prompt "$REDACTED_PROMPT" \
  --arg flagged "$FLAGGED" \
  '{
    event: $event,
    date: $date,
    timestamp: $ts,
    user: $user,
    prompt: $prompt,
    flaggedKeywords: (if $flagged != "" then ($flagged | split(" ")) else [] end)
  }' >> logs/copilot-audit.jsonl

# If sensitive keywords found — also write to warnings log
if [ -n "$FLAGGED" ]; then
  echo "[$DATE] ⚠️  SENSITIVE KEYWORDS in prompt | user=$USER | keywords=$FLAGGED" \
    >> logs/warnings.log
fi

exit 0