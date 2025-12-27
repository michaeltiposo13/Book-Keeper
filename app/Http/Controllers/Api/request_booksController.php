<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\request_books;
use Illuminate\Support\Facades\Validator;

class request_booksController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = request_books::with(['borrower', 'book', 'payments']);
            
            // Filter by borrower_id
            if ($request->has('borrower_id')) {
                $query->where('borrower_id', $request->borrower_id);
            }
            
            // Filter by book_id
            if ($request->has('book_id')) {
                $query->where('book_id', $request->book_id);
            }
            
            // Filter by approval_status
            if ($request->has('approval_status')) {
                $query->where('approval_status', $request->approval_status);
            }
            
            $requests = $query->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Book requests retrieved successfully',
                'data' => $requests
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'borrower_id' => 'required|exists:borrowers,borrower_id',
            'book_id' => 'required|exists:books,book_id',
            'request_date' => 'required|date',
            'borrow_date' => 'nullable|date',
            'due_date' => 'nullable|date|after:borrow_date',
            'return_date' => 'nullable|date',
            'approval_status' => 'required|string|in:pending,approved,rejected,returned',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $requestBook = request_books::create($request->only([
                'borrower_id', 'book_id', 'request_date', 'borrow_date',
                'due_date', 'return_date', 'approval_status', 'quantity', 'remarks'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Book request created successfully',
                'data' => $requestBook
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create book request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $requestBook = request_books::with(['borrower', 'book', 'payments'])->find($id);
    
            if (!$requestBook) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book request not found'
                ], 404);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Book request retrieved successfully',
                'data' => $requestBook
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'borrower_id' => 'sometimes|exists:borrowers,borrower_id',
            'book_id' => 'sometimes|exists:books,book_id',
            'request_date' => 'sometimes|date',
            'borrow_date' => 'nullable|date',
            'due_date' => 'nullable|date|after:borrow_date',
            'return_date' => 'nullable|date',
            'approval_status' => 'sometimes|string|in:pending,approved,rejected,returned',
            'quantity' => 'sometimes|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $requestBook = request_books::find($id);

            if (!$requestBook) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book request not found'
                ], 404);
            }

            $requestBook->update($request->only([
                'borrower_id', 'book_id', 'request_date', 'borrow_date',
                'due_date', 'return_date', 'approval_status', 'quantity', 'remarks'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Book request updated successfully',
                'data' => $requestBook
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update book request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $requestBook = request_books::find($id);

            if (!$requestBook) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book request not found'
                ], 404);
            }

            $requestBook->delete();

            return response()->json([
                'success' => true,
                'message' => 'Book request deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book request',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}