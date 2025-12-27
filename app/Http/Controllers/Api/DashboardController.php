<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\books;
use App\Models\borrowers;
use App\Models\categories;
use App\Models\request_books;
use App\Models\payments;
use App\Models\supplier;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function statistics()
    {
        try {
            $totalBooks = books::count();
            $totalCategories = categories::count();
            $totalBorrowers = borrowers::count();
            $totalSuppliers = supplier::count();
            
            $totalRequests = request_books::count();
            $approvedRequests = request_books::where('approval_status', 'approved')->count();
            $pendingRequests = request_books::where('approval_status', 'pending')->count();
            
            $totalPayments = payments::count();
            $totalPaymentAmount = payments::sum('amount');
            $paidPayments = payments::where('paid_status', 'paid')->sum('amount');
            
            // Get recent requests
            $recentRequests = request_books::with(['borrower', 'book'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            
            // Get most borrowed books
            $mostBorrowedBooks = request_books::select('book_id', DB::raw('count(*) as total_requests'))
                ->groupBy('book_id')
                ->orderBy('total_requests', 'desc')
                ->limit(5)
                ->with('book')
                ->get();
            
            // Get payment statistics by method
            $paymentStatsByMethod = payments::select('payment_method', DB::raw('count(*) as total'), DB::raw('sum(amount) as total_amount'))
                ->groupBy('payment_method')
                ->get();
            
            // Get requests by status
            $requestsByStatus = request_books::select('approval_status', DB::raw('count(*) as total'))
                ->groupBy('approval_status')
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Dashboard statistics retrieved successfully',
                'data' => [
                    'totals' => [
                        'books' => $totalBooks,
                        'categories' => $totalCategories,
                        'borrowers' => $totalBorrowers,
                        'suppliers' => $totalSuppliers,
                    ],
                    'requests' => [
                        'total' => $totalRequests,
                        'approved' => $approvedRequests,
                        'pending' => $pendingRequests,
                    ],
                    'payments' => [
                        'total_count' => $totalPayments,
                        'total_amount' => $totalPaymentAmount,
                        'paid_amount' => $paidPayments,
                    ],
                    'recent_requests' => $recentRequests,
                    'most_borrowed_books' => $mostBorrowedBooks,
                    'payment_stats_by_method' => $paymentStatsByMethod,
                    'requests_by_status' => $requestsByStatus,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overdue books
     */
    public function overdueBooks()
    {
        try {
            $overdueBooks = request_books::where('due_date', '<', now())
                ->where('approval_status', 'approved')
                ->whereNull('return_date')
                ->with(['borrower', 'book'])
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Overdue books retrieved successfully',
                'data' => $overdueBooks
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve overdue books',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly statistics
     */
    public function monthlyStats()
    {
        try {
            // Get monthly request stats
            $monthlyRequests = request_books::select(
                DB::raw('MONTH(request_date) as month'),
                DB::raw('YEAR(request_date) as year'),
                DB::raw('count(*) as total')
            )
                ->groupBy(DB::raw('MONTH(request_date)'), DB::raw('YEAR(request_date)'))
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();
            
            // Get monthly payment stats
            $monthlyPayments = payments::select(
                DB::raw('MONTH(payment_date) as month'),
                DB::raw('YEAR(payment_date) as year'),
                DB::raw('count(*) as total'),
                DB::raw('sum(amount) as total_amount')
            )
                ->groupBy(DB::raw('MONTH(payment_date)'), DB::raw('YEAR(payment_date)'))
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Monthly statistics retrieved successfully',
                'data' => [
                    'monthly_requests' => $monthlyRequests,
                    'monthly_payments' => $monthlyPayments,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve monthly statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
