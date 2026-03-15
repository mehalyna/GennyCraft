#!/bin/bash

echo "Setting up Home Wallet application..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements-dev.txt

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update .env with your configuration!"
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Create default categories
echo "Creating default categories..."
python manage.py create_default_categories

# Create superuser
echo "Do you want to create a superuser? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
    python manage.py createsuperuser
fi

echo ""
echo "Setup complete!"
echo "To start the development server, run: python manage.py runserver"
