<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\borrowersController;
use App\Http\Controllers\Api\book_authorsController;
use App\Http\Controllers\Api\booksController;
use App\Http\Controllers\Api\request_booksController;
use App\Http\Controllers\Api\categoriesController;
use App\Http\Controllers\Api\paymentsController;
use App\Http\Controllers\Api\suppliersController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;



// Public Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Dashboard & Statistics API
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('/dashboard/overdue-books', [DashboardController::class, 'overdueBooks']);
    Route::get('/dashboard/monthly-stats', [DashboardController::class, 'monthlyStats']);
    
    // Borrowers API - CRUD operations
    Route::get('/borrowers', [borrowersController::class, 'index']);
    Route::post('/borrowers', [borrowersController::class, 'store']);
    Route::get('/borrowers/{id}', [borrowersController::class, 'show']);
    Route::put('/borrowers/{id}', [borrowersController::class, 'update']);
    Route::delete('/borrowers/{id}', [borrowersController::class, 'destroy']);
    
    // Books API - CRUD operations
    Route::get('/books', [booksController::class, 'index']);
    Route::post('/books', [booksController::class, 'store']);
    Route::get('/books/{id}', [booksController::class, 'show']);
    Route::put('/books/{id}', [booksController::class, 'update']);
    Route::delete('/books/{id}', [booksController::class, 'destroy']);
    
    // Book Authors API - CRUD operations
    Route::get('/book-authors', [book_authorsController::class, 'index']);
    Route::post('/book-authors', [book_authorsController::class, 'store']);
    Route::get('/book-authors/{id}', [book_authorsController::class, 'show']);
    Route::put('/book-authors/{id}', [book_authorsController::class, 'update']);
    Route::delete('/book-authors/{id}', [book_authorsController::class, 'destroy']);
    
    // Categories API - CRUD operations
    Route::get('/categories', [categoriesController::class, 'index']);
    Route::post('/categories', [categoriesController::class, 'store']);
    Route::get('/categories/{id}', [categoriesController::class, 'show']);
    Route::put('/categories/{id}', [categoriesController::class, 'update']);
    Route::delete('/categories/{id}', [categoriesController::class, 'destroy']);
    
    // Suppliers API - CRUD operations
    Route::get('/suppliers', [suppliersController::class, 'index']);
    Route::post('/suppliers', [suppliersController::class, 'store']);
    Route::get('/suppliers/{id}', [suppliersController::class, 'show']);
    Route::put('/suppliers/{id}', [suppliersController::class, 'update']);
    Route::delete('/suppliers/{id}', [suppliersController::class, 'destroy']);
    
    // Request Books API - CRUD operations
    Route::get('/request-books', [request_booksController::class, 'index']);
    Route::post('/request-books', [request_booksController::class, 'store']);
    Route::get('/request-books/{id}', [request_booksController::class, 'show']);
    Route::put('/request-books/{id}', [request_booksController::class, 'update']);
    Route::delete('/request-books/{id}', [request_booksController::class, 'destroy']);
    
    // Payments API - CRUD operations
    Route::get('/payments', [paymentsController::class, 'index']);
    Route::post('/payments', [paymentsController::class, 'store']);
    Route::get('/payments/{id}', [paymentsController::class, 'show']);
    Route::put('/payments/{id}', [paymentsController::class, 'update']);
    Route::delete('/payments/{id}', [paymentsController::class, 'destroy']);
});