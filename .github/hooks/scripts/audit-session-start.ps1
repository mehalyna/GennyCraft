#!/usr/bin/env pwsh
# Audit session start - logs Copilot session initialization

param()

$INPUT = [Console]::In.ReadToEnd()
$data = $INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue

# Extract fields
$TIMESTAMP = if ($data.timestamp) { $data.timestamp } else { "" }
$CWD = if ($data.cwd) { $data.cwd } else { "" }
$SOURCE = if ($data.source) { $data.source } else { "unknown" }
$INITIAL_PROMPT = if ($data.initialPrompt) { $data.initialPrompt } else { "" }
$USER = if ($env:USERNAME) { $env:USERNAME } else { "unknown" }
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Ensure logs directory exists
$logsDir = Join-Path $PSScriptRoot ".." ".." ".." "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Redact sensitive patterns
$REDACTED_PROMPT = $INITIAL_PROMPT `
    -replace 'ghp_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'gho_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghu_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghs_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'Bearer [A-Za-z0-9_\-\.]+', 'Bearer [REDACTED]' `
    -replace '--password[= ][^ ]+', '--password=[REDACTED]' `
    -replace '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[REDACTED_EMAIL]'

# Create audit entry
$auditEntry = @{
    event = "sessionStart"
    date = $DATE
    timestamp = $TIMESTAMP
    user = $USER
    cwd = $CWD
    source = $SOURCE
    initialPrompt = $REDACTED_PROMPT
} | ConvertTo-Json -Compress

# Append to audit log as JSONL
$auditLog = Join-Path $logsDir "copilot-audit.jsonl"
Add-Content -Path $auditLog -Value $auditEntry

# Also write human-readable session log
$sessionLog = Join-Path $logsDir "session.log"
$logLine = "[$DATE] SESSION STARTED | user=$USER | source=$SOURCE | cwd=$CWD"
Add-Content -Path $sessionLog -Value $logLine

exit 0
