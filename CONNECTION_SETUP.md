# Backend-Frontend Connection Setup

This document explains how the frontend is connected to the Laravel backend.

## Configuration

### Backend (Laravel)
- **Port**: 8000 (default Laravel port)
- **API Base URL**: `http://localhost:8000/api`
- **CORS**: Configured in `config/cors.php` to allow requests from `http://localhost:3000`

### Frontend (React/Vite)
- **Port**: 3000
- **API Base URL**: Configured via environment variable `VITE_API_BASE_URL`
- **Default**: `http://localhost:8000/api` (if env var not set)

## Environment Variables

Create a `.env` file in the frontend root directory with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

If you're running the backend on a different port or domain, update this value accordingly.

## How It Works

1. **API Service** (`src/lib/api.ts`):
   - Centralized axios instance with interceptors
   - Automatically adds Bearer token to requests
   - Handles 401 errors by clearing auth and redirecting to login

2. **Authentication** (`src/contexts/AuthContext.tsx`):
   - Uses real API endpoints instead of localStorage
   - Stores auth token in localStorage
   - Verifies token on app load

3. **CORS Configuration**:
   - Backend allows requests from frontend origin
   - Supports credentials for authentication

## Starting the Applications

### Backend (Laravel)
```bash
cd C:\laragon\www\pagekeeperrrrrrr
php artisan serve
```

### Frontend (React)
```bash
cd "C:\laragon\www\Library Management System front"
npm run dev
```

## API Endpoints

All API endpoints are documented in `API_DOCUMENTATION.md` in the backend directory.

The frontend uses the following API modules:
- `authAPI` - Authentication (login, register, logout, me)
- `booksAPI` - Books CRUD operations
- `borrowersAPI` - Borrowers CRUD operations
- `categoriesAPI` - Categories CRUD operations
- `suppliersAPI` - Suppliers CRUD operations
- `requestBooksAPI` - Book requests CRUD operations
- `paymentsAPI` - Payments CRUD operations
- `bookAuthorsAPI` - Book authors CRUD operations
- `dashboardAPI` - Dashboard statistics

## Troubleshooting

### CORS Errors
- Ensure backend CORS config includes your frontend URL
- Check that backend is running on port 8000
- Verify `config/cors.php` has correct allowed origins

### Authentication Issues
- Check that token is being stored in localStorage
- Verify API base URL is correct
- Check browser console for API errors

### Connection Issues
- Ensure both backend and frontend are running
- Check that ports 3000 and 8000 are not in use
- Verify firewall settings allow local connections

