<?php

namespace App\Http\Controllers;

use App\Models\MedicineItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicineItemController extends Controller
{
    public function index()
    {
        return response()->json(
            MedicineItem::where('user_id', Auth::id())->paginate(3)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'generic' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'strength' => 'required|string|max:255',
            'route' => 'required|string|max:255',
        ]);

        $item = MedicineItem::create([
            'user_id' => Auth::id(),
            'generic' => $request->generic,
            'brand' => $request->brand,
            'dosage' => $request->dosage,
            'strength' => $request->strength,
            'route' => $request->route,
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = MedicineItem::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'generic' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'strength' => 'required|string|max:255',
            'route' => 'required|string|max:255',
        ]);

        $item->update([
            'generic' => $request->generic,
            'brand' => $request->brand,
            'dosage' => $request->dosage,
            'strength' => $request->strength,
            'route' => $request->route,
        ]);

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = MedicineItem::where('user_id', Auth::id())->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
