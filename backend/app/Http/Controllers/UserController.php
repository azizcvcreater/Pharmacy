<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | AUTH (Admin Registration)
    |--------------------------------------------------------------------------
    */

    // Register ADMIN only (your customers)
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $admin = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'admin',
        ]);

        return response()->json([
            'message' => 'Admin registered successfully',
            'data'    => $admin->only('id', 'name', 'email', 'role')
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | STAFF MANAGEMENT (Admin Only)
    |--------------------------------------------------------------------------
    */

    public function indexStaff(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staff = User::staffOf($admin->id)->get();

        return response()->json(['data' => $staff]);
    }

    public function storeStaff(Request $request)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $staff = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'staff',
            'admin_id' => $admin->id,
        ]);

        return response()->json([
            'message' => 'Staff created successfully',
            'data'    => $staff
        ], 201);
    }

    public function updateStaff(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staff = User::staffOf($admin->id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($staff->id)],
            'password' => 'sometimes|string|min:8',
        ]);

        if (isset($validated['name'])) {
            $staff->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $staff->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $staff->password = Hash::make($validated['password']);
        }

        $staff->save();

        return response()->json([
            'message' => 'Staff updated successfully',
            'data'    => $staff
        ]);
    }

    public function destroyStaff(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $staff = User::staffOf($admin->id)->where('id', $id)->firstOrFail();

        $staff->delete();

        return response()->json([
            'message' => 'Staff deleted successfully'
        ]);
    }
}
