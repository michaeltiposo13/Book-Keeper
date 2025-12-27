<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\book_authors;
use Illuminate\Support\Facades\Validator;

class book_authorsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = book_authors::with('book');
            
            // Filter by book_id
            if ($request->has('book_id')) {
                $query->where('book_id', $request->book_id);
            }
            
            // Search by author name
            if ($request->has('search')) {
                $query->where('author_name', 'like', "%{$request->search}%");
            }
            
            $authors = $query->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Book authors retrieved successfully',
                'data' => $authors
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book authors',
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
            'book_id' => 'required|exists:books,book_id',
            'author_name' => 'required|string|max:150',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $author = book_authors::create($request->only(['book_id', 'author_name', 'bio']));

            return response()->json([
                'success' => true,
                'message' => 'Book author created successfully',
                'data' => $author
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create book author',
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
            $author = book_authors::with('book')->find($id);
    
            if (!$author) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book author not found'
                ], 404);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Book author retrieved successfully',
                'data' => $author
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve book author',
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
            'book_id' => 'sometimes|exists:books,book_id',
            'author_name' => 'sometimes|string|max:150',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $author = book_authors::find($id);

            if (!$author) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book author not found'
                ], 404);
            }

            $author->update($request->only(['book_id', 'author_name', 'bio']));

            return response()->json([
                'success' => true,
                'message' => 'Book author updated successfully',
                'data' => $author
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update book author',
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
            $author = book_authors::find($id);

            if (!$author) {
                return response()->json([
                    'success' => false,
                    'message' => 'Book author not found'
                ], 404);
            }

            $author->delete();

            return response()->json([
                'success' => true,
                'message' => 'Book author deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete book author',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}