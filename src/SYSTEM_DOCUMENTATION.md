# Book Keeper - Library Management System
## Complete System Documentation

### 🎯 System Overview
Book Keeper is a complete, modern, and responsive Library Management System featuring:
- **Dual Interface**: Separate admin and member portals
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **7 Core Modules**: Borrowers, Categories, Suppliers, Books, Book Authors, Requests, Payments
- **Philippine Integration**: Peso currency (₱) and Asia/Manila timezone
- **Complete Borrowing System**: 10-day period, 3-book limit, fines, ratings
- **Digital Reading**: Full book content with pagination
- **Payment System**: Multiple payment methods with proof upload

---

## 🔐 Authentication

### Default Accounts

**Admin Account:**
- Email: `admin@library.com`
- Password: `admin123`

**Member Accounts:**
- Email: `maria.santos@email.com` / Password: `member123`
- Email: `juan.delacruz@email.com` / Password: `member123`
- Email: `sofia.reyes@email.com` / Password: `member123`

---

## 📚 Core Features

### 1. **Books Management** (Admin Only)
- ✅ Add/Edit/Delete books
- ✅ Upload cover photos (stored in localStorage)
- ✅ Cover photos display in:
  - Grid view
  - List view
  - Book details dialog
  - Member browse books
  - Member dashboard
- ✅ Track quantity and availability
- ✅ Filter by category
- ✅ View borrower history

### 2. **Borrowing System**
- ✅ **10-day borrowing period** (automatic calculation)
- ✅ **3-book limit** per member
- ✅ **Approval workflow**: Member requests → Admin approves → Book becomes active
- ✅ **Early return**: Members can return books before due date
- ✅ **Automatic fines**: ₱5 per day late (calculated on return)
- ✅ **Mandatory rating**: Members must rate/review before returning

### 3. **Payment System**
- ✅ Multiple payment methods:
  - GCash QR
  - Maya QR
  - GoTyme QR
- ✅ Payment features:
  - Upload proof of payment (screenshot)
  - Add optional notes
  - Pending → Paid workflow (admin confirms)
- ✅ Automatic late fee creation on overdue returns
- ✅ Borrowing restriction for unpaid fines

### 4. **Digital Book Reading**
- ✅ Full 5-page content for all 10 books
- ✅ Beautiful book reader interface
- ✅ Page navigation
- ✅ Available for active borrows only

### 5. **Notifications System**
- ✅ Real-time notifications
- ✅ Unread count badge
- ✅ Notification types: info, success, warning, error
- ✅ Clickable to navigate to relevant pages
- ✅ Mark as read/Mark all as read
- ✅ Clear individual/Clear all

### 6. **Request Management** (Admin)
- ✅ View all pending book requests
- ✅ Approve requests (converts to active borrow with dates)
- ✅ Reject requests (removes from system)
- ✅ Activity logging

### 7. **Borrowers Management** (Admin)
- ✅ View all members
- ✅ Edit member details
- ✅ Delete members (cleans up associated data)
- ✅ View borrowing history
- ✅ Track payment status

### 8. **Categories & Suppliers** (Admin)
- ✅ Manage book categories
- ✅ Manage supplier information
- ✅ Track books per category/supplier

---

## 🎨 User Interfaces

### Admin Portal (`/admin`)
**Sidebar Navigation:**
- Dashboard (KPIs and stats)
- Borrowers
- Categories
- Suppliers
- Books
- Requests
- Payments
- Settings

**Features:**
- Global search
- Notifications dropdown
- Profile menu
- Dark/Light theme toggle

### Member Portal (`/member`)
**Sidebar Navigation:**
- Home (Dashboard)
- Browse Books
- My Borrows
- My Payments
- Settings

**Features:**
- Book search by title/author/category
- Real-time availability
- Request/borrow books
- Read digital books
- Rate and review
- Submit payments
- Profile management

---

## 🔄 Complete User Flows

### Flow 1: Member Borrows a Book
1. Member logs in → Member Dashboard
2. Browse Books → Select a book
3. Click "Request Book"
4. System checks:
   - ✅ No unpaid fines
   - ✅ < 3 active borrows
5. Request submitted (status: pending)
6. Notification sent
7. Admin sees request in Requests module
8. Admin approves
9. System:
   - Sets borrowDate = today
   - Sets dueDate = today + 10 days
   - Status = active
10. Member can now read the book digitally

### Flow 2: Member Returns a Book
1. My Borrows → Active book → "Return Book"
2. Rating dialog appears (mandatory)
3. Member rates (1-5 stars) and reviews
4. System calculates fine:
   - If returnDate > dueDate: fine = days late × ₱5
   - Else: fine = 0
5. If fine > 0:
   - Creates Late Fee payment (status: Unpaid)
   - Member cannot borrow new books until paid
6. Book status = returned
7. Rating saved

### Flow 3: Member Pays Fine
1. My Payments → Unpaid payment → "Pay Now"
2. Select payment method (GCash/Maya/GoTyme)
3. QR code displayed
4. Upload proof of payment (screenshot)
5. Add optional note
6. Submit → Status = Pending
7. Admin sees in Payments module
8. Admin verifies proof → "Confirm Payment"
9. Status = Paid
10. Member can borrow books again

---

## 💾 Data Storage (localStorage)

### Global Keys:
- `library_users` - All users (admin + members)
- `book_requests` - All book requests (global)
- `mock_data_initialized` - Initialization flag

### Per-User Keys:
- `borrows_{userId}` - User's borrow history
- `payments_{userId}` - User's payment records
- `member_settings_{userId}` - User settings
- `admin_activity_{userId}` - Admin action log
- `profile_image_{userId}` - Profile photo

### Per-Book Keys:
- `book_cover_{bookId}` - Book cover photo

---

## ⚙️ System Settings

### Admin Settings (Global):
- Library name
- Email
- Phone
- Address
- Operating hours
- Late fee rate
- Max borrow days
- Max books per member

### Member Settings (Personal):
- Email notifications
- SMS notifications
- Profile customization
- Theme preferences

---

## 🔍 System Health Check

The system includes automatic health checking on startup:

```typescript
performSystemHealthCheck()
```

**Checks:**
- ✅ Data consistency between requests and borrows
- ✅ Orphaned pending borrows
- ✅ Missing late fee payments
- ✅ Invalid date formats
- ✅ User data integrity

**Auto-Fixes:**
- Creates missing payment records
- Removes orphaned data
- Syncs requests with borrows
- Validates dates

---

## 🎯 Business Rules

### Borrowing Rules:
1. Maximum 3 active borrows per member
2. 10-day borrowing period
3. Cannot borrow with unpaid fines
4. Must rate before returning

### Fine Calculation:
- Rate: ₱5 per day
- Calculated on return
- Days late = returnDate - dueDate
- Automatic payment record creation

### Payment Rules:
- Pending payments block new borrows
- Proof of payment required
- Admin must confirm
- Multiple payment methods supported

### Book Request Rules:
- Only 1 request per book per user
- Admin must approve
- Can be cancelled before approval
- Converts to active borrow on approval

---

## 🎨 UI/UX Features

### Design System:
- Clean, modern interface
- Subtle shadows and rounded corners
- Gradient accents
- Responsive grid layouts
- Professional typography

### Visual Feedback:
- Toast notifications
- Loading states
- Success/Error messages
- Badge indicators
- Status colors:
  - Green: Paid/Active/Success
  - Yellow: Pending/Warning
  - Red: Unpaid/Overdue/Error
  - Blue: Info

### Navigation:
- Sidebar with active state
- Breadcrumbs
- Back buttons
- Clickable cards
- Quick actions

---

## 📊 Dashboard KPIs

### Admin Dashboard:
- Total Books
- Active Borrows
- Pending Requests
- Total Revenue
- Recent activity
- Quick actions

### Member Dashboard:
- Currently Borrowed (count + list with covers)
- Pending Requests
- Completed Returns
- Outstanding Balance
- Quick borrow action

---

## 🔔 Notification System

### Notification Types:
- **info**: Book requests, general updates
- **success**: Approvals, confirmations
- **warning**: Due dates, reminders
- **error**: Rejections, errors

### Features:
- Dropdown with unread count
- Real-time updates
- Persistent across sessions
- Clickable (navigates to relevant page)
- Bulk actions (mark all read, clear all)

---

## 🚀 Performance Optimizations

1. **Efficient localStorage usage**
   - Organized key structure
   - JSON serialization
   - Lazy loading

2. **State Management**
   - React Context for global state
   - Local state for component-specific
   - Optimized re-renders

3. **Image Handling**
   - Base64 encoding for covers
   - Fallback gradients
   - Lazy loading

4. **Data Consistency**
   - Automatic health checks
   - Synchronization on actions
   - Orphan cleanup

---

## 🛡️ Security Notes

**Current Implementation (Frontend Only):**
- Password storage in localStorage (plain text)
- Client-side validation
- Role-based UI restrictions

**⚠️ Before Production Backend:**
- Implement proper authentication (JWT/OAuth)
- Hash passwords (bcrypt)
- Server-side validation
- API rate limiting
- HTTPS only
- CORS configuration
- Input sanitization
- SQL injection prevention

---

## 🔧 Technical Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation
- **Sonner** - Toast notifications
- **localStorage** - Data persistence

---

## ✨ Polish & Quality

### Code Quality:
- ✅ TypeScript for type safety
- ✅ Consistent naming conventions
- ✅ Modular component structure
- ✅ Reusable UI components
- ✅ Clean separation of concerns

### User Experience:
- ✅ Intuitive navigation
- ✅ Clear feedback messages
- ✅ Logical workflows
- ✅ Error handling
- ✅ Validation messages
- ✅ Confirmation dialogs
- ✅ Loading states

### Data Integrity:
- ✅ Automatic health checks
- ✅ Consistent date formatting
- ✅ Orphan data cleanup
- ✅ Relationship validation
- ✅ State synchronization

---

## 📝 Next Steps (Backend Integration)

### Priority 1: Authentication
- JWT token system
- Password hashing
- Session management
- Role-based permissions

### Priority 2: Database
- PostgreSQL/MySQL setup
- Schema design
- Migrations
- Relationships

### Priority 3: API
- RESTful API endpoints
- Request validation
- Error handling
- Rate limiting

### Priority 4: File Storage
- Cloud storage for book covers
- Proof of payment storage
- Profile images
- CDN integration

### Priority 5: Email/SMS
- Email notifications
- SMS reminders
- Payment confirmations
- Overdue alerts

---

## 🎉 System Status

**Current State:** ✅ Production-Ready Frontend
- All features implemented
- Data consistency validated
- User flows tested
- UI polished
- Error handling in place
- Mock data populated
- Health checks running

**Ready For:** Backend integration, deployment, user testing

---

## 📞 Support & Maintenance

### Key Files:
- `/lib/initializeMockData.ts` - Initial data setup
- `/lib/systemHealthCheck.ts` - Health validation
- `/contexts/AuthContext.tsx` - Authentication
- `/contexts/NotificationContext.tsx` - Notifications
- `/contexts/SettingsContext.tsx` - Settings

### Common Tasks:
1. **Add new book**: Admin → Books → Add Book → Upload cover
2. **Reset data**: Clear localStorage → Refresh page
3. **Debug issues**: Check browser console for health check results
4. **Test user flow**: Use maria.santos@email.com / member123

---

*System polished and ready for backend integration* ✨
