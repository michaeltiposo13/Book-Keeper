<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\borrowers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class borrowersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $borrowers = borrowers::all();
            
            return response()->json([
                'success' => true,
                'message' => 'Borrowers retrieved successfully',
                'data' => $borrowers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve borrowers',
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:borrowers,email',
            'password' => 'required|string|min:8',
            'joined_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $borrower = borrowers::create([
                'name' => $request->name,
                'email' => $request->email,
                'password_hash' => Hash::make($request->password),
                'joined_date' => $request->joined_date,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Borrower created successfully',
                'data' => $borrower
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create borrower',
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
            $borrower = borrowers::with('requestBooks')->find($id);
    
            if (!$borrower) {
                return response()->json([
                    'success' => false,
                    'message' => 'Borrower not found'
                ], 404);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Borrower retrieved successfully',
                'data' => $borrower
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve borrower',
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
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:borrowers,email,' . $id . ',borrower_id',
            'password' => 'sometimes|string|min:8',
            'joined_date' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $borrower = borrowers::find($id);

            if (!$borrower) {
                return response()->json([
                    'success' => false,
                    'message' => 'Borrower not found'
                ], 404);
            }

            $updateData = $request->only(['name', 'email', 'joined_date']);
            
            if ($request->has('password')) {
                $updateData['password_hash'] = Hash::make($request->password);
            }

            $borrower->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Borrower updated successfully',
                'data' => $borrower
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update borrower',
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
            $borrower = borrowers::find($id);

            if (!$borrower) {
                return response()->json([
                    'success' => false,
                    'message' => 'Borrower not found'
                ], 404);
            }

            $borrower->delete();

            return response()->json([
                'success' => true,
                'message' => 'Borrower deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete borrower',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
