<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DoctorController extends Controller
{
    public function index()
    {
        $doctors = Doctor::where('user_id', Auth::id())
            ->latest()
            ->paginate(3);
        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fees' => 'required|numeric|min:0',
            'sonography_fee' => 'nullable|numeric|min:0',
            'ecg_fee' => 'nullable|numeric|min:0',
            'xray_fee' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
        ]);

        $doctor = Doctor::create([
            'user_id' => Auth::id(),
            'fees' => $request->fees,
            'sonography_fee' => $request->sonography_fee,
            'ecg_fee' => $request->ecg_fee,
            'xray_fee' => $request->xray_fee,
            'description' => $request->description,
        ]);

        return response()->json($doctor, 201);
    }

    public function show($id)
    {
        $doctor = Doctor::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($doctor);
    }

    public function update(Request $request, $id)
    {
        $doctor = Doctor::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'fees' => 'required|numeric|min:0',
            'sonography_fee' => 'nullable|numeric|min:0',
            'ecg_fee' => 'nullable|numeric|min:0',
            'xray_fee' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:500',
        ]);

        $doctor->update([
            'fees' => $request->fees,
            'sonography_fee' => $request->sonography_fee,
            'ecg_fee' => $request->ecg_fee,
            'xray_fee' => $request->xray_fee,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Doctor fees updated successfully',
            'doctor' => $doctor,
        ]);
    }

    public function destroy($id)
    {
        $doctor = Doctor::where('user_id', Auth::id())->findOrFail($id);
        $doctor->delete();
        return response()->json(['message' => 'Doctor fees deleted successfully']);
    }
}
