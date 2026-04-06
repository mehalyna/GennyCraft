#!/usr/bin/env pwsh
# Audit user prompts - logs each prompt submitted to Copilot

param()

$INPUT = [Console]::In.ReadToEnd()
$data = $INPUT | ConvertFrom-Json -ErrorAction SilentlyContinue

# Extract fields
$TIMESTAMP = if ($data.timestamp) { $data.timestamp } else { "" }
$PROMPT = if ($data.prompt) { $data.prompt } else { "" }
$USER = if ($env:USERNAME) { $env:USERNAME } else { "unknown" }
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Ensure logs directory exists
$logsDir = Join-Path $PSScriptRoot ".." ".." ".." "logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Redact sensitive patterns
$REDACTED_PROMPT = $PROMPT `
    -replace 'ghp_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'gho_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghu_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'ghs_[A-Za-z0-9]{20,}', '[REDACTED_TOKEN]' `
    -replace 'Bearer [A-Za-z0-9_\-\.]+', 'Bearer [REDACTED]' `
    -replace '--password[= ][^ ]+', '--password=[REDACTED]' `
    -replace '--token[= ][^ ]+', '--token=[REDACTED]' `
    -replace '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[REDACTED_EMAIL]'

# Flag sensitive keywords
$SENSITIVE_KEYWORDS = @("password", "secret", "token", "api_key", "private_key", "credential")
$FLAGGED = @()

foreach ($keyword in $SENSITIVE_KEYWORDS) {
    if ($PROMPT -match $keyword) {
        $FLAGGED += $keyword
    }
}

$FLAGGED_STR = $FLAGGED -join " "

# Create audit entry
$auditEntry = @{
    event = "userPromptSubmitted"
    date = $DATE
    timestamp = $TIMESTAMP
    user = $USER
    prompt = $REDACTED_PROMPT
    flagged = $FLAGGED_STR
} | ConvertTo-Json -Compress

# Append to audit log as JSONL
$auditLog = Join-Path $logsDir "copilot-audit.jsonl"
Add-Content -Path $auditLog -Value $auditEntry

exit 0
