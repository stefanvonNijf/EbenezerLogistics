<?php

namespace App\Http\Controllers;

use App\Models\PbmCategory;
use App\Models\PbmItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PbmController extends Controller
{
    public function index()
    {
        return Inertia::render('PBM/Index', [
            'items'      => PbmItem::with('category')->orderBy('name')->get(),
            'categories' => PbmCategory::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('PBM/Create', [
            'categories' => PbmCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'pbm_category_id'  => 'nullable|exists:pbm_categories,id',
            'size'             => 'nullable|string|max:50',
            'amount_in_stock'  => 'required|integer|min:0',
            'minimal_stock'    => 'nullable|integer|min:0',
            'replacement_cost' => 'nullable|numeric|min:0',
        ]);

        PbmItem::create($validated);

        return redirect()->route('pbm.index')->with('success', 'PPE item created successfully.');
    }

    public function edit(PbmItem $pbm)
    {
        return Inertia::render('PBM/Edit', [
            'item'       => $pbm->load('category'),
            'categories' => PbmCategory::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, PbmItem $pbm)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'pbm_category_id'  => 'nullable|exists:pbm_categories,id',
            'size'             => 'nullable|string|max:50',
            'amount_in_stock'  => 'required|integer|min:0',
            'minimal_stock'    => 'nullable|integer|min:0',
            'replacement_cost' => 'nullable|numeric|min:0',
        ]);

        $pbm->update($validated);

        return redirect()->route('pbm.index')->with('success', 'PPE item updated successfully.');
    }

    public function destroy(PbmItem $pbm)
    {
        $pbm->delete();

        return redirect()->route('pbm.index')->with('success', 'PPE item deleted successfully.');
    }

    public function incrementStock(PbmItem $pbm)
    {
        $pbm->increment('amount_in_stock');
        return back();
    }

    public function decrementStock(PbmItem $pbm)
    {
        if ($pbm->amount_in_stock > 0) {
            $pbm->decrement('amount_in_stock');
        }
        return back();
    }

    // --- Category management ---

    public function storeCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:pbm_categories,name']);
        PbmCategory::create(['name' => $request->name]);
        return back();
    }

    public function updateCategory(Request $request, PbmCategory $pbmCategory)
    {
        $request->validate(['name' => 'required|string|unique:pbm_categories,name,' . $pbmCategory->id]);
        $pbmCategory->update(['name' => $request->name]);
        return back();
    }

    public function destroyCategory(PbmCategory $pbmCategory)
    {
        $pbmCategory->delete();
        return back();
    }
}
