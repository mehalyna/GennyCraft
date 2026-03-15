# Home Wallet - Implementation Guide

This document provides an overview of the generated Django application structure and implementation details.

## Project Overview

Home Wallet is a comprehensive personal finance management application built with Django and Django REST Framework. It allows users to track income and expenses, categorize transactions, generate reports, and export/import data.

## Generated Structure

```
GennyCraft/
├── home_wallet/              # Main Django project
│   ├── settings/             # Split settings configuration
│   │   ├── __init__.py
│   │   ├── base.py          # Base settings
│   │   ├── dev.py           # Development settings
│   │   └── prod.py          # Production settings
│   ├── __init__.py
│   ├── celery.py            # Celery configuration
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI application
│   ├── asgi.py              # ASGI application
│   └── health.py            # Health check endpoint
│
├── accounts/                 # User authentication app
│   ├── models.py            # Custom User model
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API views
│   ├── urls.py              # URL routing
│   ├── admin.py             # Django admin configuration
│   ├── signals.py           # Django signals
│   ├── tests.py             # Unit tests
│   └── apps.py
│
├── categories/              # Category management app
│   ├── models.py            # Category model
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API viewsets
│   ├── urls.py              # URL routing
│   ├── admin.py             # Django admin configuration
│   ├── tests.py             # Unit tests
│   └── management/
│       └── commands/
│           └── create_default_categories.py  # Default categories command
│
├── transactions/            # Transaction management app
│   ├── models.py            # Transaction and RecurringInstance models
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API viewsets
│   ├── filters.py           # Django filters
│   ├── permissions.py       # Custom permissions
│   ├── urls.py              # URL routing
│   ├── admin.py             # Django admin configuration
│   └── tests.py             # Unit tests
│
├── reports/                 # Analytics and reporting app
│   ├── views.py             # Report API views
│   ├── urls.py              # URL routing
│   └── apps.py
│
├── audit/                   # Audit logging app
│   ├── models.py            # AuditLog model
│   ├── signals.py           # Audit signals
│   ├── admin.py             # Django admin configuration
│   └── apps.py
│
├── static/                  # Static files (CSS, JS, images)
├── templates/               # Django templates
├── media/                   # User uploaded files
├── logs/                    # Application logs
│
├── manage.py                # Django management script
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Development dependencies
├── Dockerfile               # Docker image configuration
├── docker-compose.yml       # Docker compose configuration
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── .dockerignore            # Docker ignore rules
├── pytest.ini               # Pytest configuration
├── setup.sh                 # Setup script (Unix)
├── setup.bat                # Setup script (Windows)
├── spec.md                  # Original specification
└── README.md                # Project documentation
```

## Key Features Implemented

### 1. User Authentication & Authorization
- Custom email-based user model
- JWT token authentication
- User registration, login, logout
- Password change and reset (structure in place)
- User profile management

### 2. Category Management
- Global (system-wide) categories
- User-specific custom categories
- Category types: income, expense, or both
- Default categories with icons and colors
- Management command to create defaults

### 3. Transaction Management
- CRUD operations for transactions
- Soft delete functionality
- File attachments for receipts
- Transaction filtering and search
- CSV export functionality
- Transaction types: income and expense
- Support for recurring transactions (model ready)

### 4. Reports & Analytics
- Financial summary by date range
- Category breakdown
- Trend analysis
- Dashboard with current balance
- All-time statistics

### 5. Audit Logging
- Track create/update/delete operations
- User action logging
- IP address tracking
- JSON-based change tracking

### 6. Security Features
- JWT-based authentication with refresh tokens
- Owner-based permission checks
- File upload validation
- CORS configuration
- HTTPS enforcement in production
- CSRF protection

### 7. API Documentation
- OpenAPI/Swagger UI at `/api/docs/`
- Schema endpoint at `/api/schema/`
- Interactive API testing

## Models

### User (accounts.User)
- Email-based authentication
- Timezone and locale support
- Default currency preference
- Email verification status

### Category (categories.Category)
- Name, type (income/expense/both)
- Color and icon for UI
- Owner (null for global categories)
- Active/inactive status

### Transaction (transactions.Transaction)
- Type (income/expense)
- Amount and currency
- Date
- Category (foreign key)
- Title and note
- Attachment (file upload)
- Recurring fields
- Soft delete support

### AuditLog (audit.AuditLog)
- User, action, model name
- Object ID
- Changes (JSON field)
- IP address and timestamp

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /register/` - Register new user
- `POST /login/` - Login (get JWT tokens)
- `POST /token/refresh/` - Refresh access token
- `POST /logout/` - Logout (blacklist token)
- `GET /profile/` - Get user profile
- `PUT /profile/` - Update user profile
- `POST /password/change/` - Change password
- `POST /password/reset/` - Request password reset
- `POST /password/reset/confirm/` - Confirm password reset

### Categories (`/api/categories/`)
- Standard REST endpoints (list, create, retrieve, update, delete)
- `GET /income/` - Get income categories
- `GET /expense/` - Get expense categories

### Transactions (`/api/transactions/`)
- Standard REST endpoints with filtering
- `GET /export/` - Export to CSV
- `POST /import_csv/` - Import from CSV (stub)
- `POST /{id}/attach_file/` - Attach file
- `DELETE /{id}/remove_attachment/` - Remove attachment

### Reports (`/api/reports/`)
- `GET /summary/` - Financial summary
- `GET /category-breakdown/` - Spending by category
- `GET /trends/` - Transaction trends
- `GET /dashboard/` - Dashboard data

## Configuration

### Environment Variables
The application uses environment variables for configuration. See `.env.example` for all available options.

Key variables:
- `DEBUG` - Debug mode
- `SECRET_KEY` - Django secret key
- `DATABASE_URL` - Database connection
- `REDIS_URL` - Redis connection
- `ALLOWED_HOSTS` - Allowed hosts
- `EMAIL_*` - Email configuration
- `JWT_*` - JWT token lifetimes

### Settings Structure
Settings are split into three files:
- `base.py` - Common settings
- `dev.py` - Development overrides
- `prod.py` - Production overrides

## Testing

The project includes:
- Basic test structure for each app
- Pytest configuration
- Test coverage setup

Run tests:
```bash
pytest
pytest --cov=. --cov-report=html
```

## Next Steps

### Immediate Implementation Needs
1. **Email Verification**: Implement email sending and verification tokens
2. **Password Reset**: Complete password reset functionality with email
3. **CSV Import**: Implement CSV import with validation
4. **Recurring Transactions**: Build recurring transaction generation logic
5. **Rate Limiting**: Add rate limiting to authentication endpoints
6. **File Serving**: Implement secure file serving for attachments
7. **Multi-currency**: Complete multi-currency support with conversion

### Optional Enhancements
1. **Web UI**: Build web interface using Django templates or separate frontend
2. **Notifications**: Email/push notifications for transactions
3. **Budgets**: Budget tracking and alerts
4. **Data Visualization**: Advanced charts and graphs
5. **Mobile App**: Mobile application using the API
6. **Data Export**: Additional export formats (PDF, Excel)
7. **Backup/Restore**: User data backup and restore
8. **Two-Factor Auth**: Add 2FA support

## Development Workflow

### Initial Setup
```bash
# Run setup script
./setup.sh  # Unix/Mac
setup.bat   # Windows

# Or manually:
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env
python manage.py migrate
python manage.py create_default_categories
python manage.py createsuperuser
python manage.py runserver
```

### Docker Workflow
```bash
docker-compose up -d
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py create_default_categories
docker-compose exec web python manage.py createsuperuser
```

### Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Creating a Superuser
```bash
python manage.py createsuperuser
```

### Running Development Server
```bash
python manage.py runserver
```

### Celery (for background tasks)
```bash
celery -A home_wallet worker -l info
```

## Security Considerations

1. **Change SECRET_KEY** in production
2. **Use strong passwords** for database and admin accounts
3. **Enable HTTPS** in production (configured in prod settings)
4. **Configure CORS** properly for your frontend
5. **Set up email backend** for production
6. **Configure file upload limits** appropriately
7. **Regular backups** of database and media files
8. **Monitor logs** for suspicious activity

## Database Schema

The application uses PostgreSQL (recommended) but can work with SQLite for development.

Key relationships:
- User ← Categories (one-to-many)
- User ← Transactions (one-to-many)
- Category ← Transactions (one-to-many)
- Transaction ← RecurringInstance (one-to-many)
- User ← AuditLog (one-to-many)

## Performance Considerations

1. **Database Indexes**: Key indexes are defined in models
2. **Query Optimization**: Use `select_related()` and `prefetch_related()`
3. **Pagination**: Enabled by default (50 items per page)
4. **Caching**: Redis configured for Celery, can be used for view caching
5. **Static Files**: Whitenoise configured for static file serving

## Deployment

### Docker Deployment
The project includes Docker configuration for easy deployment. See `docker-compose.yml` for services.

### Production Checklist
- [ ] Set DEBUG=False
- [ ] Configure SECRET_KEY
- [ ] Set up PostgreSQL database
- [ ] Configure email backend
- [ ] Set ALLOWED_HOSTS
- [ ] Configure static/media file storage (S3 recommended)
- [ ] Set up SSL/HTTPS
- [ ] Configure domain and CORS
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Review security settings

## Support

For issues and questions:
- Review the README.md
- Check the spec.md for requirements
- Review Django and DRF documentation
- Check application logs in `logs/` directory
