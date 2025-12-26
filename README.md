**BookKeeper - Library Management System**



**Project Overview**

BookKeeper is a comprehensive full-stack web application designed for modern library management, featuring a complete borrowing system with digital book reading capabilities. This system streamlines manual library operations by providing a centralized platform where administrators can manage books, borrowers, and transactions, while members can browse, borrow, and read books digitally.



Project Type: Final Project - ITE 18 Application Development and Emerging Technologies

Student: Michael D. Tiposo

Course/Section: ITE18-EJ1

Submission Date: December 22-26, 2025



**Target Users**

Library Administrators - Manage books, borrowers, categories, suppliers, and oversee borrowing requests



Library Members - Browse books, submit borrowing requests, read digital content, make payments



Library Staff - Process requests, manage inventory, handle payments





------------------------------------------------------------------------------------------------------------------





Key Features

Authentication \& User Management

User registration and login with email/password



Laravel Sanctum token-based authentication



Role-based access (Admin/Member)



Password hashing and validation



Session management with token refresh



Profile management





--------------------------------------------------------------------------------------------------------------------





**Book Inventory Management (Admin)**

Complete CRUD operations for books



Category and supplier management



Author assignment to books



Book cover image upload and display



ISBN validation and uniqueness



**Inventory tracking**



**Borrowing System**

Book request submission by members



Admin approval/rejection workflow



Automatic due date calculation (10-day borrowing period)



Borrowing limits (3 books per member maximum)



Digital book access for approved loans



Return processing with rating requirement



Digital Book Reading

Paginated book content display



Navigation between pages



Reading progress tracking



Access restricted to active borrows



Responsive reading interface





-------------------------------------------------------------------------------------





Payment Processing

Automatic fine calculation (₱5 per day for late returns)



Multiple payment methods (GCash, Maya, GoTyme)



Payment proof upload



Admin payment verification



Payment status tracking



Request Management (Admin)

View all pending requests



Approve/reject requests



Automatic borrow date assignment



Activity logging



Notifications System

Real-time user notifications



Request status updates



Payment reminders



Due date alerts



System announcements



Dashboard Analytics (Admin)

Total books, borrowers, active borrows tracking



Revenue tracking



Popular books analytics



System health monitoring



🛠 Technology Stack

Backend

Framework: Laravel 10+ (PHP 8.2+)



Database: MySQL 8.0+



Authentication: Laravel Sanctum



API: RESTful JSON APIs



Tools: Composer, Laravel Artisan



Frontend

Framework: React 18 with TypeScript



Build Tool: Vite



Styling: Tailwind CSS, CSS3



UI Components: shadcn/ui



Tools: Node.js 18+, npm



Development Tools

Version Control: Git



API Testing: Postman



Design: Figma





-------------------------------------------------------------------------------------------------------------------





**Database Architecture**

Core Entities

Borrowers - User information, authentication, roles



Books - Book catalog with metadata



Categories - Book classification system



Suppliers - Book procurement relationships



Book Authors - Author-book relationships (junction table)



Request Books - Borrowing workflow management



Payments - Financial transactions and fines



**Relationships**

Borrowers → Request Books: One-to-Many



Books → Request Books: One-to-Many



Categories → Books: One-to-Many



Suppliers → Books: One-to-Many



Books → Book Authors: One-to-Many



Borrowers → Payments: One-to-Many





------------------------------------------------------------------------------------





**Installation \& Setup**

Prerequisites

PHP 8.2 or higher



Composer



Node.js 18+ and npm



MySQL 8.0+



Git




-------------------------------------------------------------------------------------




**Backend Setup**


# Clone the repository

git clone \[repository-url]

cd pagekeeperrrrrrr



\# Install PHP dependencies

composer install



\# Configure environment

cp .env.example .env

\# Edit .env with your database credentials



\# Generate application key

php artisan key:generate



\# Configure Sanctum

php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"



\# Run migrations

php artisan migrate



\# Seed database (optional)

php artisan db:seed



\# Generate storage link

php artisan storage:link



\# Start development server

php artisan serve





----------------------------------------------------------------------------------------------





**Frontend Setup**



cd "Library Management System front"



\# Install dependencies

npm install



\# Configure environment

cp .env.example .env

\# Edit .env with your API URL



\# Start development server

npm run dev





---------------------------------------------------------------------------------





**Running the Application**

Backend: php artisan serve → http://127.0.0.1:8000

Frontend: npm run dev → http://localhost:5173





---------------------------------------------------------------------------------





**Backend (Laravel)**



pagekeeperrrrrrr/

├── app/

│   ├── Http/Controllers/Api/

│   │   ├── AuthController.php

│   │   ├── BorrowersController.php

│   │   ├── BooksController.php

│   │   ├── CategoriesController.php

│   │   ├── SuppliersController.php

│   │   ├── RequestBooksController.php

│   │   ├── PaymentsController.php

│   │   └── BookAuthorsController.php

│   ├── Models/

│   │   ├── Borrower.php

│   │   ├── Book.php

│   │   ├── Category.php

│   │   ├── Supplier.php

│   │   ├── RequestBook.php

│   │   ├── Payment.php

│   │   └── BookAuthor.php

│   └── Middleware/

├── database/

│   ├── migrations/

│   └── seeders/

├── routes/

│   └── api.php

└── .env





-------------------------------------------------------------------





Frontend (React/TypeScript)





Library Management System front/

├── src/

│   ├── components/

│   │   ├── layout/

│   │   │   ├── Sidebar.tsx

│   │   │   ├── MemberSidebar.tsx

│   │   │   └── Header.tsx

│   │   ├── ui/ (shadcn/ui components)

│   │   └── shared/

│   ├── pages/

│   │   ├── admin/

│   │   │   ├── Dashboard.tsx

│   │   │   ├── Books.tsx

│   │   │   ├── Borrowers.tsx

│   │   │   ├── Categories.tsx

│   │   │   ├── Suppliers.tsx

│   │   │   └── Payments.tsx

│   │   └── member/

│   │       ├── MemberDashboard.tsx

│   │       ├── BrowseBooks.tsx

│   │       ├── MyBorrowings.tsx

│   │       └── MyPayments.tsx

│   ├── contexts/

│   │   ├── AuthContext.tsx

│   │   └── NotificationContext.tsx

│   ├── lib/

│   │   ├── api.ts

│   │   └── systemHealthCheck.ts

│   └── App.tsx

├── public/

└── package.json







----------------------------------------------------------------







API Endpoints

Authentication

POST /api/auth/register - Register new member



POST /api/auth/login - User login



POST /api/auth/logout - Logout



GET /api/auth/me - Get authenticated user

------------------------------------------------

Books

GET /api/books - List books (with filters)



POST /api/books - Create book



GET /api/books/{id} - Get book details



PUT /api/books/{id} - Update book



DELETE /api/books/{id} - Delete book

------------------------------------------------

Borrowers

GET /api/borrowers - List borrowers



POST /api/borrowers - Create borrower



GET /api/borrowers/{id} - Get borrower



PUT /api/borrowers/{id} - Update borrower



DELETE /api/borrowers/{id} - Delete borrower

---------------------------------------------------

Categories

GET /api/categories - List categories



POST /api/categories - Create category



PUT /api/categories/{id} - Update category



DELETE /api/categories/{id} - Delete category

---------------------------------------------------

Request Books

GET /api/requests - List borrowing requests



POST /api/requests - Submit borrowing request



PUT /api/requests/{id}/approve - Approve request



PUT /api/requests/{id}/reject - Reject request



PUT /api/requests/{id}/return - Mark as returned

--------------------------------------------------

Payments

GET /api/payments - List payments



POST /api/payments - Create payment



PUT /api/payments/{id}/verify - Verify payment

----------------------------------------------------------------------

Design System

Color Scheme

Primary: Blue (#2563eb) - Admin interface \& primary actions



Secondary: Green (#16a34a) - Member interface \& success states



Accent: Orange (#ea580c) - Warnings \& highlights



Neutral: Gray scale for backgrounds and text



Typography

Font Family: Inter (sans-serif)



Headings: 24px–32px



Body Text: 14px–16px



Small Text: 12px for metadata



Security Features

Laravel Sanctum for API authentication



Password hashing with bcrypt



Role-based middleware protection



Input validation and sanitization



CORS configuration



SQL injection prevention via Eloquent ORM





-----------------------------------------------------------------------------------



Testing

The following test cases have been successfully implemented:



✓ User authentication



✓ Book CRUD operations



✓ Borrowing workflow



✓ Payment processing



✓ Admin dashboard



✓ Digital reading functionality





-------------------------------------------------------------------------------------





Known Limitations

Single-branch library support only



No advanced search filters (basic search only)



Limited reporting features



No offline support



No physical book tracking (RFID/barcodes)



Code Standards

Backend (PHP/Laravel)

Classes: PascalCase (BorrowersController, Book)



Methods: camelCase (createBorrower, updateBook)



Variables: camelCase ($borrower, $bookData)



Database: snake\_case (borrower\_id, book\_title)



Frontend (TypeScript/React)

Components: PascalCase (BooksList, MemberDashboard)



Functions/Variables: camelCase (fetchBooks, userData)



Interfaces: PascalCase (Book, Borrower)



Files: PascalCase for components



User Stories \& Acceptance Criteria

User Story 1: Browse Available Books

As a library member, I want to browse available books so that I can discover new reading materials.



Acceptance Criteria:



✓ Books are displayed in grid/list view with covers



✓ Search and filter functionality works



✓ Book details show availability status



User Story 2: Manage Book Inventory

As an administrator, I want to manage the book inventory so that the catalog remains current.



Acceptance Criteria:



✓ Admin dashboard allows book creation and updates



✓ Category and supplier management included



✓ Book-author relationships maintained



User Story 3: Borrow Books Digitally

As a library member, I want to borrow books digitally so that I can read them online.



Acceptance Criteria:



✓ Members can request book loans



✓ Admin approval workflow implemented



✓ Digital reading available for approved loans



Development Timeline

Week 1: Planning \& UI Design



Week 2: Backend Setup \& Database



Week 3: API Development



Week 4-5: Frontend Development



Week 6: Integration \& Testing





-------------------------------------------------------------------------------------------------





Additional Resources

Wireframes \& Mockups: Figma Design



API Documentation: Available in Postman collection



Source Code: GitHub Repository



License

This project is developed as part of ITE 18 - Application Development and Emerging Technologies coursework. All rights reserved.

