# Home Wallet — Requirements for Django application

1. Overview
   The Home Wallet application stores and manages users' personal finances, specifically income and expenses. The system must allow authenticated users to create, view, edit and delete financial records, categorize them, view summaries and reports, and export/import data. The application will be implemented with Django and Django REST Framework for API access, with a simple web UI for end users.

2. Actors and roles

1) End user. A registered and authenticated person who manages their own wallet data.
2) Admin. A site administrator who can manage users, categories, and system settings.

3. High-level user stories (acceptance-focused)

1) As an end user, I want to register and log in so I can store my wallet data privately.
2) As an end user, I want to add income and expense records with date, amount, category and note so I can track my finances.
3) As an end user, I want to edit and delete my records so I can correct mistakes.
4) As an end user, I want categories (predefined and user-defined) to classify records.
5) As an end user, I want to see balance, totals by period, and simple charts so I can understand my cashflow.
6) As an end user, I want to filter and search records by date, category, amount range and text so I can find entries.
7) As an end user, I want to import and export my data in CSV format for backups and offline analysis.
8) As an admin, I want to manage system categories and users.

4. Functional requirements

1) Authentication and authorization. Support user registration, login, logout, password reset by email, and token-based API authentication (JWT or DRF token). Only authenticated users may access their own data. Admins have elevated access.
2) Record management. Create, read, update, delete (CRUD) for financial records. Each record must be typed as income or expense. Soft-delete is optional but recommended for recovery.
3) Categories. Provide default categories (e.g., Salary, Groceries, Utilities, Rent, Transport) and allow users to create/edit/delete their own categories. Categories have type: income, expense, or both.
4) Recurring transactions. Allow users to mark records as recurring and specify recurrence rules (daily, weekly, monthly). The system should generate upcoming instances optionally.
5) Attachments. Allow optional upload of a receipt image per record (limit file size and validate type). Store attachments securely.
6) Search and filters. Provide filters by date range, category, amount range, text search in notes, and type (income/expense).
7) Reports and dashboards. Provide: current balance, totals per period (day/week/month/year), comparison with previous period, top categories by spend, and simple trend chart. API endpoints must return aggregated data for charts.
8) Export / Import. Export user data to CSV. Import CSV into user account with validation and reporting of failed rows.
9) Audit log. Record create/update/delete operations (user, timestamp, change summary) for compliance and troubleshooting.
10) Validation and business rules. Amount must be positive. Date cannot be in the far future (configurable max). Category must exist and match the record type. Required fields: amount, date, type, category.
11) Multi-currency support (optional). Store currency per record and provide a base currency for aggregated reports. Currency conversions are out of scope unless explicitly requested.
12) Localization. Support at least English and one additional language (configurable). Date and number formats should adapt to locale.

5. Data model (core entities)

1) User. Use Django built-in User or a custom user model. Fields: id, email (unique), password, first_name, last_name, timezone, locale, created_at, updated_at.
2) Category. Fields: id, owner (nullable for global categories), name, type (income|expense|both), color (optional), created_at, updated_at.
3) Transaction (financial record). Fields: id, owner (FK -> User), type (income|expense), amount (Decimal with two+ decimal places), currency (ISO code), date (date/time), category (FK -> Category), title (short text), note (text), recurring_rule (nullable, store RRULE string or structured fields), is_deleted (boolean), attachment (file path), created_at, updated_at.
4) RecurringInstance (optional). Fields: id, transaction_template (FK -> Transaction), next_date, frequency, last_generated_at.
5) AuditLog. Fields: id, user (FK -> User), action (create|update|delete|import|export), model_name, object_id, changes (JSON), timestamp, ip_address (optional).

6. API design (suggested endpoints)

1) Authentication: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, POST /api/auth/password-reset.
2) Categories: GET /api/categories/, POST /api/categories/, GET /api/categories/{id}/, PUT/PATCH /api/categories/{id}/, DELETE /api/categories/{id}/. Global categories returned along with user's own categories.
3) Transactions: GET /api/transactions/?filters, POST /api/transactions/, GET /api/transactions/{id}/, PUT/PATCH /api/transactions/{id}/, DELETE /api/transactions/{id}/. Support bulk-create for import.
4) Reports: GET /api/reports/summary?start=YYYY-MM-DD&end=YYYY-MM-DD, GET /api/reports/category-breakdown, GET /api/reports/trends?period=monthly.
5) Export/Import: GET /api/transactions/export?format=csv, POST /api/transactions/import (multipart/form-data).
6) Attachments: POST /api/transactions/{id}/attachment, GET /api/transactions/{id}/attachment (serve with permission checks).
7) Admin: GET /api/admin/users, PUT /api/admin/users/{id}/ (admin only).
   All APIs must enforce owner isolation so a user can only access their own records.

7. UI screens (web)

1) Landing page with brief feature list and sign-in/up actions.
2) Dashboard showing balance, recent transactions, and charts.
3) Transaction list with filters and search, and pagination.
4) Transaction create/edit form with validation and optional attachment upload.
5) Categories management page.
6) Import/export page with CSV template and import result display.
7) Settings page for profile, timezone, locale, currency preferences.
8) Admin panel for system-level management.

8. Non-functional requirements

1) Security. Use HTTPS only. Hash passwords with a strong algorithm (Django default PBKDF2 or better). Protect file uploads, validate file types and size. Implement rate limiting on auth endpoints. Implement CSRF protection for cookie-based sessions. Use token authentication with secure storage on clients.
2) Privacy. Users must only access their own data. Data export should be explicit and logged. Provide a way for users to delete their account and data (GDPR-friendly).
3) Performance. Typical response times under 500 ms for list endpoints with reasonable dataset sizes. Use database indexes on owner, date, category, and type. Paginate lists.
4) Scalability. Design for single-tenant per user data isolation within same DB. Consider sharding or separate DB per tenant if user base grows.
5) Reliability. Provide backups for DB and uploaded attachments. Implement migrations with Django migrations.
6) Testability. Provide unit tests for models and business logic, integration tests for API endpoints, and UI tests for critical flows.
7) Accessibility. Follow a11y basics (labels, keyboard navigation).
8) Localization. Text should be translatable; support timezones per user.

9. Data validation and constraints (detailed)

1) Amount must be numeric, greater than zero, stored as Decimal with fixed precision.
2) Date must be parseable in the user locale and stored in UTC in DB, converted on display.
3) Category selection must validate that category belongs to user or is a global category.
4) Uploads must be limited to common image types (jpg, png, pdf optionally) and size limit (e.g., 5 MB).
5) CSV import must validate columns and skip or report invalid rows; no partial silent failures.

10. Security and privacy specifics

1) Use Django's custom user model to use email as primary identifier. Require email verification on registration.
2) Store attachments outside of webroot and serve via signed URLs.
3) Log authentication failures and suspicious activity for admin review.
4) Rate-limit login and password-reset endpoints.
5) Encrypt sensitive logs and backups containing personal data.
6) Provide role-based admin access and audit trails for admin actions.

11. Testing and acceptance criteria

1) Unit tests cover model validation, category ownership checks, and recurring transaction generation logic.
2) API tests cover authentication, permission checks, transaction CRUD, import/export, and report endpoints.
3) End-to-end test that registers a user, creates categories, creates transactions, exports CSV, deletes the account.
4) Performance test that a user with 10k transactions can page through lists and fetch summary in under 1 second in a reasonable environment.

12. Deployment and operations

1) Deployable via Docker. Provide Dockerfile and docker-compose for local dev and staging.
2) Use environment variables for secrets and settings.
3) Use a managed relational DB (Postgres recommended), object storage for attachments (S3-compatible).
4) Provide setup script for initial data migration and default categories.
5) Backups: daily DB dumps and daily backup of attachments.
6) Monitoring: basic health endpoint /health/ and application metrics export (Prometheus compatible optional).

13. Deliverables and timeline suggestions (example minimal MVP scope)

1) MVP scope: user auth, transaction CRUD, basic category management, dashboard summary, CSV export, tests and Docker.
2) Optional second-phase features: recurring transactions UI, attachments, advanced reports, import CSV, multi-currency.

14. Acceptance checklist (quick)

1) User registration, login and logout work securely.
2) Users can create, update, delete transactions and categories.
3) Dashboard shows correct totals and balance.
4) CSV export produces valid file with all user records.
5) Permissions prevent cross-user access.
6) Tests cover main flows and pass.

