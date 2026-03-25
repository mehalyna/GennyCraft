---
applyTo: '**'
description: 'Core GennyCraft architecture rules'
---

# GennyCraft Architecture

## App responsibilities
- accounts/      → user accounts and wallet management
- transactions/  → all financial transactions (CRUD)
- categories/    → transaction categorization
- reports/       → aggregated financial reports
- audit/         → change tracking and history
- logs/          → system and error logging

## Data isolation rule
Every queryset MUST filter by request.user.
No exceptions. This is a financial application.

## Dependency rules
- transactions depends on: accounts, categories
- reports depends on: transactions, categories
- audit depends on: all apps (read-only)