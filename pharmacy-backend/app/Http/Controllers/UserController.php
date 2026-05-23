<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller{

    public function index(Request $request){
        $users = User::where('pharmacy_id', $request->user()->pharmacy_id)->get();

        return response()->json([
            'data' => $users
        ]);
    }

    public function store(Request $request){
        $authUser = $request->user();

        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:staff',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'pharmacy_id' => $authUser->pharmacy_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'data' => $user,
        ]);
    }

    public function update(Request $request, $id){
        $authUser = $request->user();

        $user = User::where('id', $id)
            ->where('pharmacy_id', $authUser->pharmacy_id)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:staff',
            'password' => 'sometimes|min:6'
        ]);

        $data = $request->only(['name', 'email', 'role']);

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'status' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function destroy(Request $request, $id){
        $authUser = $request->user();

        $user = User::where('id', $id)
            ->where('pharmacy_id', $authUser->pharmacy_id)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
