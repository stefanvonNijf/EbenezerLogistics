<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Role;
use Illuminate\Http\Request;
use App\Models\Tool;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ToolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tools = Tool::with('category')
            ->orderByRaw('(minimal_stock IS NOT NULL AND amount_in_stock <= minimal_stock) DESC')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Tool/Index', ['tools' => $tools]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Tool/Create', [
            'categories' => Category::orderBy('name')->get(),
            'roles' => Role::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'brand' => 'nullable|string',
            'type' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'roletype' => 'required|string',
            'amount_in_stock' => 'required|integer|min:0',
            'minimal_stock' => 'nullable|integer|min:0',
            'replacement_cost' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('tools', 'public');
            $validated['image_path'] = $path;
        }

        Tool::create($validated);

        return redirect()->route('tools.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tool $tool)
    {
        return inertia('Tool/Edit', [
            'tool' => $tool,
            'categories' => Category::orderBy('name')->get(),
            'roles' => Role::orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'brand' => 'nullable|string',
            'type' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'roletype' => 'required|string',
            'amount_in_stock' => 'required|integer|min:0',
            'minimal_stock' => 'nullable|integer|min:0',
            'replacement_cost' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            if ($tool->image_path && Storage::disk('public')->exists($tool->image_path)) {
                Storage::disk('public')->delete($tool->image_path);
            }

            $validated['image_path'] = $request->file('image')->store('tools', 'public');
        }

        $tool->update($validated);


        return redirect()->route('tools.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tool $tool)
    {
        $tool->delete();

        return redirect()
            ->route('tools.index')
            ->with('success', 'Tool deleted successfully.');
    }

    public function incrementStock(Tool $tool)
    {
        $tool->increment('amount_in_stock');
        return back();
    }

    public function decrementStock(Tool $tool)
    {
        if ($tool->amount_in_stock > 0) {
            $tool->decrement('amount_in_stock');
        }

        return back();
    }
}
