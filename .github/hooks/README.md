# GitHub Copilot Audit Logging

This directory contains hooks that automatically log GitHub Copilot activity for audit and compliance purposes.

## What Gets Logged

| Event | Trigger | Information Captured |
|-------|---------|---------------------|
| **sessionStart** | When a Copilot session begins | User, timestamp, source, working directory, initial prompt |
| **userPromptSubmitted** | Each time you submit a prompt | User, timestamp, prompt content, flagged sensitive keywords |
| **preToolUse** | Before Copilot uses any tool | User, timestamp, tool name, tool arguments |

## Security Features

All logs automatically **redact** sensitive information:
- GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`)
- Bearer tokens
- Passwords and API keys
- Email addresses

Prompts containing sensitive keywords are **flagged** for review:
- password, secret, token, api_key, private_key, credential

## Log Files

Logs are written to the `logs/` directory:

- **copilot-audit.jsonl** - Structured JSONL format for programmatic analysis
- **session.log** - Human-readable session summary

## Platform Support

Both bash and PowerShell scripts are provided:
- **Linux/Mac/WSL** - Uses `.sh` scripts (requires `jq`)
- **Windows** - Uses `.ps1` scripts (native PowerShell)

## Configuration

The hooks are configured in `audit-logging.json`:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [...],
    "userPromptSubmitted": [...],
    "preToolUse": [...]
  }
}
```

## Enabling Audit Logging

The hooks should automatically activate when GitHub Copilot detects the `audit-logging.json` file. If they don't:

1. **Reload VS Code** - Restart the window to ensure hooks are loaded
2. **Check Copilot settings** - Ensure workspace hooks are not disabled
3. **Verify file permissions** - Scripts must be readable

## Analyzing Logs

### View recent prompts:
```powershell
Get-Content logs/copilot-audit.jsonl | Select-Object -Last 10 | ConvertFrom-Json | Format-Table
```

### Find flagged prompts:
```powershell
Get-Content logs/copilot-audit.jsonl | 
  ConvertFrom-Json | 
  Where-Object { $_.flagged -ne "" } |
  Select-Object date, user, flagged, prompt
```

### Count tools used:
```powershell
Get-Content logs/copilot-audit.jsonl | 
  ConvertFrom-Json | 
  Where-Object { $_.tool } |
  Group-Object -Property tool |
  Sort-Object Count -Descending
```

## Privacy & Compliance

- Logs are stored **locally** only (not sent anywhere)
- Add `logs/` to `.gitignore` to prevent accidental commits
- Redaction patterns can be customized in the audit scripts
- Review logs periodically and archive/delete as needed

## Troubleshooting

**Hooks not running?**
- Check VS Code Output panel → "GitHub Copilot Chat"
- Verify scripts are executable on your platform
- Test manually: `echo '{"timestamp":"test"}' | .github/hooks/scripts/audit-prompt.ps1`

**Missing `jq` on bash systems?**
- Install: `sudo apt-get install jq` (Ubuntu/Debian) or `brew install jq` (Mac)
