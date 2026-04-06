#!/usr/bin/env pwsh
# Test script to verify audit hooks are working correctly

Write-Host "`n=== Testing GennyCraft Audit Hooks ===" -ForegroundColor Cyan

# Test 1: Session Start Hook
Write-Host "`n[1/3] Testing session-start hook..." -ForegroundColor Yellow
$sessionTest = @{
    timestamp = (Get-Date).ToString("o")
    cwd = (Get-Location).Path
    source = "test"
    initialPrompt = "This is a test prompt with a ghp_secrettoken123456789012 that should be redacted"
} | ConvertTo-Json

$sessionTest | & .github/hooks/scripts/audit-session-start.ps1
Write-Host "✓ Session start logged" -ForegroundColor Green

# Test 2: Prompt Submitted Hook
Write-Host "`n[2/3] Testing prompt-submitted hook..." -ForegroundColor Yellow
$promptTest = @{
    timestamp = (Get-Date).ToString("o")
    prompt = "Show me the database password configuration"
} | ConvertTo-Json

$promptTest | & .github/hooks/scripts/audit-prompt.ps1
Write-Host "✓ Prompt logged (should be flagged for 'password')" -ForegroundColor Green

# Test 3: Tool Use Hook
Write-Host "`n[3/3] Testing tool-use hook..." -ForegroundColor Yellow
$toolTest = @{
    timestamp = (Get-Date).ToString("o")
    toolName = "read_file"
    toolArgs = @{
        filePath = "settings.py"
        startLine = 1
        endLine = 10
    }
} | ConvertTo-Json

$toolTest | & .github/hooks/scripts/audit-tool.ps1
Write-Host "✓ Tool use logged" -ForegroundColor Green

# Display results
Write-Host "`n=== Audit Log Results ===" -ForegroundColor Cyan

if (Test-Path "logs/copilot-audit.jsonl") {
    Write-Host "`n📄 Last 3 audit entries:" -ForegroundColor Yellow
    Get-Content logs/copilot-audit.jsonl | Select-Object -Last 3 | ForEach-Object {
        $entry = $_ | ConvertFrom-Json
        Write-Host "  - [$($entry.event)] $($entry.date)" -ForegroundColor White
        if ($entry.flagged) {
            Write-Host "    🚨 Flagged: $($entry.flagged)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ No audit log file found" -ForegroundColor Red
}

if (Test-Path "logs/session.log") {
    Write-Host "`n📄 Session log:" -ForegroundColor Yellow
    Get-Content logs/session.log | Select-Object -Last 3 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor White
    }
} else {
    Write-Host "❌ No session log file found" -ForegroundColor Red
}

Write-Host "`n✅ Audit hooks test complete!" -ForegroundColor Green
Write-Host "`nTo enable automatic logging, reload VS Code window." -ForegroundColor Cyan
Write-Host "Press Ctrl+Shift+P and select Developer: Reload Window" -ForegroundColor Gray
Write-Host ""
