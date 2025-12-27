# Frontend Connection Setup

This document describes how the Laravel backend is configured to connect with the React frontend.

## Configuration Changes Made

### 1. CORS Configuration
- **File**: `config/cors.php`
- **Changes**: Configured to allow requests from frontend origins:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://localhost:5173` (Vite default)
  - `http://127.0.0.1:5173`
- **Supports Credentials**: Enabled for authentication

### 2. Middleware Configuration
- **File**: `bootstrap/app.php`
- **Status**: CORS middleware is automatically applied to API routes in Laravel 11
- **Note**: No explicit middleware registration needed - Laravel handles it automatically

### 3. API Routes
- **File**: `routes/api.php`
- **Status**: All API routes are properly configured with `auth:sanctum` middleware
- **Base URL**: `/api`

## Frontend Integration

The frontend has been configured to:
1. Use axios for HTTP requests
2. Store authentication tokens in localStorage
3. Automatically add Bearer tokens to API requests
4. Handle 401 errors by redirecting to login

## Testing the Connection

### Start Backend
```bash
cd C:\laragon\www\pagekeeperrrrrrr
php artisan serve
```

### Start Frontend
```bash
cd "C:\laragon\www\Library Management System front"
npm run dev
```

### Test Authentication
1. Navigate to `http://localhost:3000`
2. Try to register a new user
3. Login with credentials
4. Verify API calls are working in browser DevTools Network tab

## API Endpoints Available

All endpoints are documented in `API_DOCUMENTATION.md`. The frontend can access:

- `/api/auth/*` - Authentication endpoints
- `/api/books/*` - Books CRUD
- `/api/borrowers/*` - Borrowers CRUD
- `/api/categories/*` - Categories CRUD
- `/api/suppliers/*` - Suppliers CRUD
- `/api/request-books/*` - Book requests CRUD
- `/api/payments/*` - Payments CRUD
- `/api/book-authors/*` - Book authors CRUD
- `/api/dashboard/*` - Dashboard statistics

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify `config/cors.php` has the correct frontend URL
2. Clear Laravel config cache: `php artisan config:clear`
3. Restart Laravel server

### Authentication Issues
1. Check that Sanctum is properly configured
2. Verify tokens are being generated correctly
3. Check browser localStorage for `auth_token`

### Connection Refused
1. Ensure Laravel server is running on port 8000
2. Check firewall settings
3. Verify frontend is pointing to correct API URL

