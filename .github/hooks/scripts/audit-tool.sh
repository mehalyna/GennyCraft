#!/bin/bash

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
TOOL_ARGS_RAW=$(echo "$INPUT" | jq -r '.toolArgs')

# Redact secrets before logging
REDACTED_ARGS=$(echo "$TOOL_ARGS_RAW" | \
  sed -E 's/ghp_[A-Za-z0-9]{20,}/[REDACTED_TOKEN]/g' | \
  sed -E 's/Bearer [A-Za-z0-9_\-\.]+/Bearer [REDACTED]/g' | \
  sed -E 's/--password[= ][^ ]+/--password=[REDACTED]/g')

mkdir -p logs

# Append to audit log as JSONL
jq -n \
  --arg ts "$TIMESTAMP" \
  --arg user "${USER:-unknown}" \
  --arg tool "$TOOL_NAME" \
  --arg args "$REDACTED_ARGS" \
  '{timestamp: $ts, user: $user, tool: $tool, args: $args}' \
  >> logs/copilot-audit.jsonl

exit 0