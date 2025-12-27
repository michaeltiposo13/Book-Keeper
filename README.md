# Backend (Laravel) - BookKeeper

This is the Laravel backend for the BookKeeper Library Management System.

For complete project documentation, please see the main [README.md](../README.md) at the root of the repository.

## Quick Start

```bash
# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate application key
php artisan key:generate

# Configure Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Generate storage link
php artisan storage:link

# Start development server
php artisan serve
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

## Admin Account

See [ADMIN_ACCOUNT.md](./ADMIN_ACCOUNT.md) for default admin credentials.
