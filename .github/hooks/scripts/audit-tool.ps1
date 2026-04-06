#!/usr/bin/env pwsh
# Audit tool usage - logs before each tool invocation

param()

$INPUT = [Console]::In.ReadToEnd()
$data = $INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue

# Extract fields
$TOOL_NAME = if ($data.toolName) { $data.toolName } else { "unknown" }
$TIMESTAMP = if ($data.timestamp) { $data.timestamp } else { "" }
$TOOL_ARGS_RAW = if ($data.toolArgs) { $data.toolArgs | ConvertTo-Json -Compress } else { "{}" }
$USER = if ($env:USERNAME) { $env:USERNAME } else { "unknown" }

# Ensure logs directory exists
$logsDir = Join-Path $PSScriptRoot ".." ".." ".." "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Redact sensitive patterns from tool arguments
$REDACTED_ARGS = $TOOL_ARGS_RAW `
    -replace 'ghp_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'gho_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghu_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghs_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'Bearer [A-Za-z0-9_\-\.]+', 'Bearer [REDACTED]' `
    -replace '--password[= ][^ ]+', '--password=[REDACTED]' `
    -replace '--token[= ][^ ]+', '--token=[REDACTED]'

# Create audit entry
$auditEntry = @{
    timestamp = $TIMESTAMP
    user = $USER
    tool = $TOOL_NAME
    args = $REDACTED_ARGS
} | ConvertTo-Json -Compress

# Append to audit log as JSONL
$auditLog = Join-Path $logsDir "copilot-audit.jsonl"
Add-Content -Path $auditLog -Value $auditEntry

exit 0
