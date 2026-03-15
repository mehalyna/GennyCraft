@echo off

echo Setting up Home Wallet application...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements-dev.txt

REM Copy .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please update .env with your configuration!
)

REM Run migrations
echo Running migrations...
python manage.py migrate

REM Create default categories
echo Creating default categories...
python manage.py create_default_categories

REM Create superuser
echo Do you want to create a superuser? (y/n)
set /p response=
if /i "%response%"=="y" (
    python manage.py createsuperuser
)

echo.
echo Setup complete!
echo To start the development server, run: python manage.py runserver
pause
