# New Features - Library Management System

## Overview
The Library Management System has been enhanced with fully functional settings, Philippine regional support, user registration, and persistent data storage.

## 🎉 New Features

### 1. Fully Functional Settings Page
All settings tabs are now fully functional with save capabilities:

#### General Tab
- **Library Information**: Edit library name, code, contact email, phone, and address
- **Regional Settings**: 
  - Timezone selection (including Asia/Manila for Philippine Time)
  - Currency selection (including PHP ₱ for Philippine Peso)
- All changes are saved and persisted across sessions

#### Library Tab
- **Borrowing Rules**: Configure max books per borrower, default borrow period, late fees, and damage fees
- **Book Management**: Toggle auto-approve requests, send reminders, and allow renewals
- Fees are displayed in the selected currency

#### Notifications Tab
- **Email Notifications**: Configure alerts for new requests, overdue books, payments, and low stock
- **Borrower Notifications**: Configure notifications for request approvals, due date reminders, and overdue notices
- All toggles are functional and save state

#### Account Tab
- **Profile Information**: Edit first name, last name, email, and phone
- **Password Change**: Change your password with validation
  - Requires current password
  - Minimum 6 characters for new password
  - Password confirmation validation
- Success/error feedback for all operations

### 2. Philippine Regional Support
The system now fully supports Philippine settings:

**Timezone Options:**
- Asia/Manila (Philippine Time) - Now default
- UTC-5 (Eastern Time)
- UTC-6 (Central Time)
- UTC-7 (Mountain Time)
- UTC-8 (Pacific Time)

**Currency Options:**
- PHP (₱) - Philippine Peso - Now default
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound

**Default Values:**
- Library Name: Book Keeper
- Library Code: LIB-2024
- Contact Email: Bookkeeper@gmail.com
- Contact Phone: 09102442221
- Address: 6th St. Village II, Butuan City, PH
- Timezone: Asia/Manila
- Currency: PHP (₱)

### 3. User Registration / Sign Up
Users can now create new accounts:

**Sign Up Features:**
- Toggle between Sign In and Sign Up modes
- Required fields: Full Name, Email, Password, Confirm Password
- Password validation (minimum 6 characters)
- Email uniqueness check
- Auto-login after successful registration
- New users are assigned "Member" role

**Access:**
- Click "Don't have an account? Sign Up" on the login page
- Fill in the registration form
- System automatically logs you in after registration

### 4. Toast Notifications
Real-time feedback for all user actions:
- Success notifications when settings are saved
- Error notifications for invalid operations
- Password change confirmations
- Displayed in the top-right corner

### 5. Data Persistence
All data is stored in browser localStorage:
- Settings persist across page refreshes
- User accounts are saved locally
- Current user session is maintained
- Regional preferences are remembered

## 🔧 Technical Implementation

### New Context: SettingsContext
- Manages all application settings
- Provides update functions for each settings category
- Automatically saves to localStorage
- Handles password change operations

### New Utilities: formatters.ts
- `formatCurrency(amount, currency)`: Format amounts with proper currency symbols
- `formatDate(date, timezone)`: Format dates according to selected timezone
- `getCurrentTime(timezone)`: Get current time in selected timezone

### Updated Components:
- **Settings.tsx**: Complete rewrite with state management and save functionality
- **Login.tsx**: Added sign-up mode with form validation
- **Payments.tsx**: Dynamic currency formatting based on settings
- **AuthContext.tsx**: Added registration support and user storage
- **App.tsx**: Added SettingsProvider and Toaster components

## 📝 Usage Instructions

### Changing Settings:
1. Navigate to Settings page from the sidebar
2. Select the tab you want to edit (General, Library, Notifications, or Account)
3. Make your changes
4. Click "Save Changes" button
5. See confirmation toast notification

### Registering a New User:
1. Go to the login page
2. Click "Don't have an account? Sign Up"
3. Enter your full name, email, and password
4. Confirm your password
5. Click "Sign Up"
6. You'll be automatically logged in

### Changing Your Password:
1. Go to Settings → Account tab
2. Scroll to "Change Password" section
3. Enter your current password
4. Enter and confirm your new password
5. Click "Change Password" button
6. See confirmation toast

### Setting Philippine Regional Preferences:
1. Go to Settings → General tab
2. Under "Regional Settings":
   - Select "Asia/Manila (Philippine Time)" for Timezone
   - Select "PHP (₱)" for Currency
3. Click "Save Changes"
4. All monetary amounts will now display in Philippine Pesos

## 🎯 Demo Accounts

The following demo accounts are still available:

**Administrator:**
- Email: admin@library.com
- Password: admin123

**Librarian:**
- Email: librarian@library.com
- Password: librarian123

## 🔒 Security Notes

- Passwords are stored in localStorage (for demo purposes only)
- In production, this should use proper backend authentication
- The system is designed for demonstration and prototyping
- Not suitable for storing sensitive personal information

## 🚀 Next Steps

Potential future enhancements:
- Connect to real backend API
- Add email verification for registration
- Implement role-based access control
- Add profile picture upload
- Export settings functionality
- Multi-language support
- Dark mode support
