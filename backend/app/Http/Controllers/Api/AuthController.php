<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // REGISTER - Creates Admin user
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users|max:255',
            'password' => 'required|min:6|confirmed',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'admin_id' => null, // Admin has no admin_id
        ];

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('profile-images', $imageName, 'public');
            $userData['profile_image'] = $imageName;
        }

        $user = User::create($userData);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Admin registered successfully',
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
            'profile_image_url' => $user->profile_image_url,
        ], 201);
    }

    // LOGIN
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
            'profile_image_url' => $user->profile_image_url,
        ]);
    }

    // GET USER
    public function me(Request $request)
    {
        $user = $request->user();
        $user->profile_image_url = $user->profile_image_url;
        return response()->json($user);
    }

    // UPDATE PROFILE
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|min:6|confirmed',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_profile_image' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('remove_profile_image') && $request->remove_profile_image) {
            if ($user->profile_image) {
                Storage::disk('public')->delete('profile-images/' . $user->profile_image);
                $user->profile_image = null;
            }
        }

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete('profile-images/' . $user->profile_image);
            }

            $image = $request->file('profile_image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('profile-images', $imageName, 'public');
            $user->profile_image = $imageName;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'profile_image_url' => $user->profile_image_url,
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // CREATE STAFF (ADMIN ONLY - Links staff to admin)
    public function createStaff(Request $request)
    {
        $admin = auth()->user();
        
        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin only.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users|max:255',
            'password' => 'required|min:6',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'staff',
            'admin_id' => $admin->id, // Link staff to this admin
        ];

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('profile-images', $imageName, 'public');
            $userData['profile_image'] = $imageName;
        }

        $user = User::create($userData);

        return response()->json([
            'message' => 'Staff created successfully',
            'user' => $user,
            'profile_image_url' => $user->profile_image_url,
        ], 201);
    }

    // GET ALL USERS (ADMIN ONLY - Only sees their staff members)
    public function getUsers(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::where('admin_id', $request->user()->id)
            ->orWhere('id', $request->user()->id)
            ->get();
            
        $users->each(function ($user) {
            $user->profile_image_url = $user->profile_image_url;
        });
        
        return response()->json($users);
    }

    // UPDATE USER (ADMIN ONLY - Can update staff or themselves)
    public function updateUser(Request $request, $id)
    {
        $admin = auth()->user();
        
        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::where(function($query) use ($admin, $id) {
            $query->where('id', $id)
                  ->where(function($q) use ($admin) {
                      $q->where('admin_id', $admin->id)
                        ->orWhere('id', $admin->id);
                  });
        })->first();
            
        if (!$user) {
            return response()->json(['message' => 'User not found or not authorized'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|in:admin,staff',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('role') && $user->id !== $admin->id) {
            $user->role = $request->role;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    // DELETE USER (ADMIN ONLY - Can delete staff only, not themselves)
    public function deleteUser(Request $request, $id)
    {
        $admin = auth()->user();
        
        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::where('id', $id)
            ->where('admin_id', $admin->id)
            ->first();
            
        if (!$user) {
            return response()->json(['message' => 'User not found or not authorized'], 404);
        }

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 403);
        }

        if ($user->profile_image) {
            Storage::disk('public')->delete('profile-images/' . $user->profile_image);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}