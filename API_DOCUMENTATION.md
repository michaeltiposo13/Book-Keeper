# API Documentation

This document describes all 10 secure APIs implemented in this Laravel application.

## Table of Contents

1. [Authentication API](#1-authentication-api)
2. [Borrowers API](#2-borrowers-api)
3. [Books API](#3-books-api)
4. [Book Authors API](#4-book-authors-api)
5. [Categories API](#5-categories-api)
6. [Suppliers API](#6-suppliers-api)
7. [Request Books API](#7-request-books-api)
8. [Payments API](#8-payments-api)
9. [Dashboard/Statistics API](#9-dashboardstatistics-api)
10. [Security Features](#10-security-features)

---

## 1. Authentication API

Base URL: `/api/auth`

### Endpoints

#### POST `/api/auth/register`
Register a new borrower

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "joined_date": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Borrower registered successfully",
  "data": {
    "borrower": {...},
    "token": "1|token...",
    "token_type": "Bearer"
  }
}
```

#### POST `/api/auth/login`
Login and get authentication token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "borrower": {...},
    "token": "1|token...",
    "token_type": "Bearer"
  }
}
```

#### POST `/api/auth/logout` (Protected)
Logout and revoke token

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me` (Protected)
Get authenticated user information

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

## 2. Borrowers API

Base URL: `/api/borrowers`

All endpoints require authentication.

### Endpoints

- **GET** `/api/borrowers` - List all borrowers
- **POST** `/api/borrowers` - Create a new borrower
- **GET** `/api/borrowers/{id}` - Get specific borrower
- **PUT** `/api/borrowers/{id}` - Update borrower
- **DELETE** `/api/borrowers/{id}` - Delete borrower

### Request/Response Examples

**Create Borrower:**
```json
POST /api/borrowers
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepass123",
  "joined_date": "2024-02-01"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Borrower created successfully",
  "data": {...}
}
```

---

## 3. Books API

Base URL: `/api/books`

All endpoints require authentication.

### Endpoints

- **GET** `/api/books` - List all books (with search, filters, pagination)
- **POST** `/api/books` - Create a new book
- **GET** `/api/books/{id}` - Get specific book
- **PUT** `/api/books/{id}` - Update book
- **DELETE** `/api/books/{id}` - Delete book

### Query Parameters (for GET `/api/books`)

- `search` - Search by title or ISBN
- `category_id` - Filter by category
- `supplier_id` - Filter by supplier
- `per_page` - Results per page (default: 15)

### Request/Response Examples

**Create Book:**
```json
POST /api/books
{
  "title": "Introduction to Laravel",
  "isbn": "978-1234567890",
  "category_id": 1,
  "supplier_id": 1
}
```

---

## 4. Book Authors API

Base URL: `/api/book-authors`

All endpoints require authentication.

### Endpoints

- **GET** `/api/book-authors` - List all book authors
- **POST** `/api/book-authors` - Create new book author
- **GET** `/api/book-authors/{id}` - Get specific author
- **PUT** `/api/book-authors/{id}` - Update author
- **DELETE** `/api/book-authors/{id}` - Delete author

### Query Parameters

- `book_id` - Filter by book ID
- `search` - Search by author name

**Create Author:**
```json
POST /api/book-authors
{
  "book_id": 1,
  "author_name": "John Author",
  "bio": "Renowned author in programming"
}
```

---

## 5. Categories API

Base URL: `/api/categories`

All endpoints require authentication.

### Endpoints

- **GET** `/api/categories` - List all categories
- **POST** `/api/categories` - Create new category
- **GET** `/api/categories/{id}` - Get specific category
- **PUT** `/api/categories/{id}` - Update category
- **DELETE** `/api/categories/{id}` - Delete category (if no books associated)

**Create Category:**
```json
POST /api/categories
{
  "category_name": "Fiction"
}
```

---

## 6. Suppliers API

Base URL: `/api/suppliers`

All endpoints require authentication.

### Endpoints

- **GET** `/api/suppliers` - List all suppliers
- **POST** `/api/suppliers` - Create new supplier
- **GET** `/api/suppliers/{id}` - Get specific supplier
- **PUT** `/api/suppliers/{id}` - Update supplier
- **DELETE** `/api/suppliers/{id}` - Delete supplier (if no books associated)

**Create Supplier:**
```json
POST /api/suppliers
{
  "supplier_name": "Book World Suppliers",
  "contact_info": "contact@bookworld.com"
}
```

---

## 7. Request Books API

Base URL: `/api/request-books`

All endpoints require authentication.

### Endpoints

- **GET** `/api/request-books` - List all book requests
- **POST** `/api/request-books` - Create new book request
- **GET** `/api/request-books/{id}` - Get specific request
- **PUT** `/api/request-books/{id}` - Update request
- **DELETE** `/api/request-books/{id}` - Delete request

### Query Parameters

- `borrower_id` - Filter by borrower
- `book_id` - Filter by book
- `approval_status` - Filter by status (pending, approved, rejected, returned)

**Create Request:**
```json
POST /api/request-books
{
  "borrower_id": 1,
  "book_id": 2,
  "request_date": "2024-03-01",
  "approval_status": "pending",
  "quantity": 1
}
```

---

## 8. Payments API

Base URL: `/api/payments`

All endpoints require authentication.

### Endpoints

- **GET** `/api/payments` - List all payments
- **POST** `/api/payments` - Create new payment
- **GET** `/api/payments/{id}` - Get specific payment
- **PUT** `/api/payments/{id}` - Update payment
- **DELETE** `/api/payments/{id}` - Delete payment

### Query Parameters

- `request_id` - Filter by request ID
- `paid_status` - Filter by status (paid, pending, failed, refunded)
- `payment_method` - Filter by method

**Create Payment:**
```json
POST /api/payments
{
  "request_id": 1,
  "amount": 100.00,
  "payment_date": "2024-03-02",
  "payment_method": "credit_card",
  "payment_type": "late_fee",
  "paid_status": "paid"
}
```

---

## 9. Dashboard/Statistics API

Base URL: `/api/dashboard`

All endpoints require authentication.

### Endpoints

#### GET `/api/dashboard/statistics`
Get overall dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totals": {
      "books": 150,
      "categories": 10,
      "borrowers": 50,
      "suppliers": 5
    },
    "requests": {
      "total": 200,
      "approved": 150,
      "pending": 20
    },
    "payments": {
      "total_count": 180,
      "total_amount": 50000.00,
      "paid_amount": 45000.00
    },
    "recent_requests": [...],
    "most_borrowed_books": [...],
    "payment_stats_by_method": [...],
    "requests_by_status": [...]
  }
}
```

#### GET `/api/dashboard/overdue-books`
Get list of overdue books

#### GET `/api/dashboard/monthly-stats`
Get monthly statistics for requests and payments

---

## 10. Security Features

### Authentication
- Laravel Sanctum for API token authentication
- Password hashing using bcrypt
- Token-based authentication with Bearer tokens

### Authorization
- Protected routes with `auth:sanctum` middleware
- User can only access their own resources where applicable

### Input Validation
- Comprehensive validation rules for all inputs
- Laravel Validator with custom error messages
- Protection against invalid data

### SQL Injection Protection
- Eloquent ORM uses prepared statements
- No raw queries with user input
- Parameterized queries throughout

### XSS Protection
- Laravel automatically escapes output
- Blade templates sanitize output

### CSRF Protection
- Sanctum handles CSRF for SPA authentication
- API tokens don't require CSRF tokens

### Error Handling
- Consistent JSON error responses
- Try-catch blocks for exception handling
- Appropriate HTTP status codes

### HTTP Status Codes
- 200: Success
- 201: Created
- 422: Validation error
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (e.g., trying to delete category with books)
- 500: Server error

---

## Testing the APIs

### Using Postman or cURL

1. **Register/Login** to get authentication token
2. **Set Authorization Header** for protected routes:
   ```
   Authorization: Bearer {your-token}
   ```
3. **Make requests** to any endpoint

### Example cURL Commands

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Michael D. Tiposo","email":"kel@example.com","password":"password123","password_confirmation":"password123","joined_date":"2024-01-15"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Books (Protected):**
```bash
curl -X GET http://localhost:8000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Logout (Protected):**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Authenticated User (Protected):**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Dashboard / Statistics API

**Get Statistics:**
```bash
curl -X GET http://localhost:8000/api/dashboard/statistics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Overdue Books:**
```bash
curl -X GET http://localhost:8000/api/dashboard/overdue-books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Monthly Stats:**
```bash
curl -X GET http://localhost:8000/api/dashboard/monthly-stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Borrowers API

**List Borrowers:**
```bash
curl -X GET http://localhost:8000/api/borrowers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Borrower by ID:**
```bash
curl -X GET http://localhost:8000/api/borrowers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Borrower:**
```bash
curl -X PUT http://localhost:8000/api/borrowers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Jane Smith Updated","email":"jane.updated@example.com","joined_date":"2024-02-01"}'
```

**Delete Borrower:**
```bash
curl -X DELETE http://localhost:8000/api/borrowers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Books API

**Get Books with Filters:**
```bash
curl -X GET "http://localhost:8000/api/books?search=Laravel&category_id=1&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Book by ID:**
```bash
curl -X GET http://localhost:8000/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Book:**
```bash
curl -X POST http://localhost:8000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Introduction to Laravel","isbn":"978-1234567890","category_id":1,"supplier_id":1}'
```

**Update Book:**
```bash
curl -X PUT http://localhost:8000/api/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Advanced Laravel","isbn":"978-1234567890","category_id":1,"supplier_id":1}'
```

**Delete Book:**
```bash
curl -X DELETE http://localhost:8000/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Book Authors API

**List Book Authors:**
```bash
curl -X GET http://localhost:8000/api/book-authors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Book Authors with Filters:**
```bash
curl -X GET "http://localhost:8000/api/book-authors?book_id=1&search=John" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Book Author:**
```bash
curl -X POST http://localhost:8000/api/book-authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"book_id":1,"author_name":"John Author","bio":"Renowned author in programming"}'
```

**Get Book Author by ID:**
```bash
curl -X GET http://localhost:8000/api/book-authors/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Book Author:**
```bash
curl -X PUT http://localhost:8000/api/book-authors/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"book_id":1,"author_name":"John Author Updated","bio":"Updated bio"}'
```

**Delete Book Author:**
```bash
curl -X DELETE http://localhost:8000/api/book-authors/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Categories API

**List Categories:**
```bash
curl -X GET http://localhost:8000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Category:**
```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"category_name":"Fiction"}'
```

**Get Category by ID:**
```bash
curl -X GET http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Category:**
```bash
curl -X PUT http://localhost:8000/api/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"category_name":"Science Fiction"}'
```

**Delete Category:**
```bash
curl -X DELETE http://localhost:8000/api/categories/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Suppliers API

**List Suppliers:**
```bash
curl -X GET http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Supplier:**
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"supplier_name":"Book World Suppliers","contact_info":"contact@bookworld.com"}'
```

**Get Supplier by ID:**
```bash
curl -X GET http://localhost:8000/api/suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Supplier:**
```bash
curl -X PUT http://localhost:8000/api/suppliers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"supplier_name":"Updated Book World","contact_info":"newcontact@bookworld.com"}'
```

**Delete Supplier:**
```bash
curl -X DELETE http://localhost:8000/api/suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Request Books API

**List Request Books:**
```bash
curl -X GET http://localhost:8000/api/request-books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Request Books with Filters:**
```bash
curl -X GET "http://localhost:8000/api/request-books?borrower_id=1&approval_status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Request Book:**
```bash
curl -X POST http://localhost:8000/api/request-books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"borrower_id":1,"book_id":2,"request_date":"2024-03-01","approval_status":"pending","quantity":1}'
```

**Get Request Book by ID:**
```bash
curl -X GET http://localhost:8000/api/request-books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Request Book:**
```bash
curl -X PUT http://localhost:8000/api/request-books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"approval_status":"approved"}'
```

**Delete Request Book:**
```bash
curl -X DELETE http://localhost:8000/api/request-books/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Payments API

**List Payments:**
```bash
curl -X GET http://localhost:8000/api/payments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Payments with Filters:**
```bash
curl -X GET "http://localhost:8000/api/payments?request_id=1&paid_status=paid" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Payment:**
```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"request_id":1,"amount":100.00,"payment_date":"2024-03-02","payment_method":"credit_card","payment_type":"late_fee","paid_status":"paid"}'
```

**Get Payment by ID:**
```bash
curl -X GET http://localhost:8000/api/payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update Payment:**
```bash
curl -X PUT http://localhost:8000/api/payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"paid_status":"paid","amount":150.00}'
```

**Delete Payment:**
```bash
curl -X DELETE http://localhost:8000/api/payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Summary

This project implements **10 fully functional and secure APIs**:

1. Authentication API (Register, Login, Logout, Me)
2. Borrowers API (Full CRUD)
3. Books API (Full CRUD + Search & Filters)
4. Book Authors API (Full CRUD)
5. Categories API (Full CRUD)
6. Suppliers API (Full CRUD)
7. Request Books API (Full CRUD + Advanced Filters)
8. Payments API (Full CRUD + Advanced Filters)
9. Dashboard/Statistics API (Aggregate Data)
10. Security & Validation (Comprehensive)

All APIs follow Laravel MVC architecture, include proper validation, security measures, and return consistent JSON responses with appropriate HTTP status codes.
