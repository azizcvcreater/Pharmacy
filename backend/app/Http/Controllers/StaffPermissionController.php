<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StaffPermission;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class StaffPermissionController extends Controller{

    public function index(){
        $pharmacyId = Auth::user()->pharmacy_id;

        $permissions = StaffPermission::whereHas('staff', function ($q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId)
              ->where('role', 'staff');
        })->get();

        $formatted = [];

        foreach ($permissions as $perm) {
            $formatted[$perm->staff_id] = (bool) $perm->can_edit_delete;
        }

        return response()->json($formatted);
    }

    public function store(Request $request){
        $request->validate([
            'staffId' => 'required|exists:users,id',
            'canEditDelete' => 'required|boolean',
        ]);

        $admin = Auth::user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $staff =User::findOrFail($request->staffId);

        if ($staff->pharmacy_id !== $admin->pharmacy_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        StaffPermission::updateOrCreate(
            ['staff_id' => $request->staffId],
            [
                'can_edit_delete' => $request->canEditDelete,
                'updated_by' => $admin->id,
                'updated_at' => now(),
            ]
        );

        return response()->json(['message' => 'Permission updated']);
    }
}
