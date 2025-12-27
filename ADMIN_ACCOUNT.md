# Admin Account Information

## Admin Credentials

**Email:** `admin@library.com`  
**Password:** `admin123`

## How to Login

1. Start the backend server:
   ```bash
   cd C:\laragon\www\pagekeeperrrrrrr
   php artisan serve
   ```

2. Start the frontend server:
   ```bash
   cd "C:\laragon\www\Library Management System front"
   npm run dev
   ```

3. Navigate to `http://localhost:3000`
4. Click "Sign In"
5. Enter the admin credentials above
6. You will be redirected to `/admin` dashboard

## Creating Additional Admin Accounts

To create more admin accounts, you can:

### Option 1: Using the Seeder
Edit `database/seeders/AdminSeeder.php` and run:
```bash
php artisan db:seed --class=AdminSeeder
```

### Option 2: Using Tinker
```bash
php artisan tinker
```
Then run:
```php
use App\Models\borrowers;
use Illuminate\Support\Facades\Hash;

borrowers::create([
    'name' => 'Admin Name',
    'email' => 'admin2@library.com',
    'password_hash' => Hash::make('password123'),
    'joined_date' => now()->toDateString(),
    'role' => 'Administrator',
]);
```

### Option 3: Direct Database Update
Update an existing borrower's role:
```bash
php artisan tinker
```
```php
use App\Models\borrowers;

$borrower = borrowers::where('email', 'user@example.com')->first();
$borrower->role = 'Administrator';
$borrower->save();
```

## Role System

- **Administrator**: Full access to admin dashboard (`/admin/*`)
- **Member**: Access to member dashboard (`/member/*`)

All new registrations default to "Member" role.

## Security Note

⚠️ **Important**: Change the default admin password in production!

To change the admin password:
```bash
php artisan tinker
```
```php
use App\Models\borrowers;
use Illuminate\Support\Facades\Hash;

$admin = borrowers::where('email', 'admin@library.com')->first();
$admin->password_hash = Hash::make('your-new-secure-password');
$admin->save();
```

