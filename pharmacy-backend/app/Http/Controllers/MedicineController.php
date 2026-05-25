<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);

        $medicines = Medicine::where('user_id', Auth::id())
            ->where('quantity', '>', 0)
            ->with('supplier:id,name') // ensure supplier relationship exists
            ->latest()
            ->paginate($perPage);

        return response()->json($medicines);
    }
}
