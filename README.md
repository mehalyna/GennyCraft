# Home Wallet

A Django-based personal finance management application for tracking income and expenses.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Categories**: Predefined and custom categories for income and expenses
- **Reports & Analytics**: View balance, trends, and category breakdowns
- **Export/Import**: CSV export/import functionality
- **Attachments**: Upload receipts and documents
- **Audit Logging**: Track all user actions for compliance
- **RESTful API**: Complete REST API with Django REST Framework
- **API Documentation**: Interactive API docs with Swagger UI

## Tech Stack

- **Backend**: Django 4.2+, Django REST Framework
- **Database**: PostgreSQL
- **Caching/Queue**: Redis, Celery
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-spectacular
- **Deployment**: Docker, docker-compose

## Project Structure

```
home_wallet/
├── accounts/          # User authentication and profile management
├── categories/        # Category management
├── transactions/      # Transaction CRUD and management
├── reports/           # Analytics and reports
├── audit/            # Audit logging
├── home_wallet/      # Project settings and configuration
│   └── settings/     # Split settings (base, dev, prod)
├── manage.py
├── requirements.txt
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis (optional, for Celery)
- Docker & Docker Compose (for containerized deployment)

### Installation

#### Option 1: Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd GennyCraft
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements-dev.txt
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration

6. Run migrations:
```bash
python manage.py migrate
```

7. Create default categories:
```bash
python manage.py create_default_categories
```

8. Create a superuser:
```bash
python manage.py createsuperuser
```

9. Run the development server:
```bash
python manage.py runserver
```

#### Option 2: Docker

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Build and run with docker-compose:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
docker-compose exec web python manage.py migrate
```

4. Create default categories:
```bash
docker-compose exec web python manage.py create_default_categories
```

5. Create a superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```

The application will be available at http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/password/change/` - Change password
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset

### Categories
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category details
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category
- `GET /api/categories/income/` - Get income categories
- `GET /api/categories/expense/` - Get expense categories

### Transactions
- `GET /api/transactions/` - List transactions (with filters)
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/{id}/` - Get transaction details
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction (soft delete)
- `GET /api/transactions/export/` - Export to CSV
- `POST /api/transactions/import_csv/` - Import from CSV
- `POST /api/transactions/{id}/attach_file/` - Attach file
- `DELETE /api/transactions/{id}/remove_attachment/` - Remove attachment

### Reports
- `GET /api/reports/summary/` - Financial summary
- `GET /api/reports/category-breakdown/` - Category breakdown
- `GET /api/reports/trends/` - Transaction trends
- `GET /api/reports/dashboard/` - Dashboard data

### API Documentation
- `GET /api/docs/` - Swagger UI
- `GET /api/schema/` - OpenAPI schema

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Create a transaction
```bash
curl -X POST http://localhost:8000/api/transactions/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": "50.00",
    "currency": "USD",
    "date": "2024-03-15T10:00:00Z",
    "category": 1,
    "title": "Grocery shopping",
    "note": "Weekly groceries"
  }'
```

## Testing

Run tests with pytest:
```bash
pytest
```

With coverage:
```bash
pytest --cov=. --cov-report=html
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `DEBUG` - Debug mode (True/False)
- `SECRET_KEY` - Django secret key
- `DATABASE_URL` - Database connection string
- `REDIS_URL` - Redis connection string
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `EMAIL_*` - Email configuration
- `JWT_ACCESS_TOKEN_LIFETIME` - JWT access token lifetime in minutes
- `JWT_REFRESH_TOKEN_LIFETIME` - JWT refresh token lifetime in minutes

## Management Commands

- `create_default_categories` - Create default global categories

## Security Considerations

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Configure proper `ALLOWED_HOSTS`
- Set up proper email backend for production
- Configure file upload limits
- Enable rate limiting
- Regular database backups

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]