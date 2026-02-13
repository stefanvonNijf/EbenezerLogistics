<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Role;
use App\Models\Tool;
use App\Models\Toolbag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ToolbagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Toolbag/Index', [
            'toolbags' => Toolbag::with('employee')->orderByRaw('CAST(REGEXP_SUBSTR(name, "[0-9]+") AS UNSIGNED)')->get(),
            'employees' => Employee::orderBy('name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Toolbag/Create', [
            'tools' => Tool::all(),
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
            'notes' => 'nullable|string',
            'type' => 'required|string',
            'tools' => 'array',
            'tools.*' => 'exists:tools,id',
        ]);

        $toolbag = Toolbag::create([
            'name' => $validated['name'],
            'notes' => $validated['notes'],
            'type' => $validated['type'],
        ]);

        $newToolIds = $validated['tools'] ?? [];

        if (!empty($newToolIds)) {
            $toolbag->tools()->attach($newToolIds);

            Tool::whereIn('id', $newToolIds)
                ->where('amount_in_stock', '>', 0)
                ->decrement('amount_in_stock');
        }

        $requiredTools = Tool::whereIn('roletype', ['shared', $validated['type']])->get();
        $selectedToolIds = collect($newToolIds);

        $isComplete = $requiredTools->pluck('id')->every(
            fn($id) => $selectedToolIds->contains($id)
        );

        $toolbag->update(['complete' => $isComplete]);

        return redirect()->route('toolbags.index')
            ->with('success', 'Toolbag created.');
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
    public function edit(Toolbag $toolbag)
    {
        $allowedRoles = ['shared', $toolbag->type];

        $tools = Tool::whereIn('roletype', $allowedRoles)->get();

        return Inertia::render('Toolbag/Edit', [
            'toolbag' => $toolbag->load('tools'),
            'tools' => $tools,
            'roles' => Role::orderBy('name')->get(),
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Toolbag $toolbag)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'notes' => 'nullable|string',
            'type' => 'required|string',
            'employee_id' => 'nullable|exists:employees,id',
            'tools' => 'array',
            'tools.*' => 'exists:tools,id',
        ]);

        $currentToolIds = $toolbag->tools->pluck('id')->toArray();
        $newToolIds = $validated['tools'] ?? [];

        $addedToolIds = array_diff($newToolIds, $currentToolIds);

        if (!empty($addedToolIds)) {
            Tool::whereIn('id', $addedToolIds)
                ->where('amount_in_stock', '>', 0)
                ->decrement('amount_in_stock');
        }

        $toolbag->tools()->sync($newToolIds);

        // Determine required tools (shared + role-specific)
        $requiredTools = Tool::whereIn('roletype', ['shared', $validated['type']])->get();
        $selectedToolIds = collect($validated['tools'] ?? []);


        // Check if complete
        $isComplete = $requiredTools->pluck('id')->every(
            fn($id) => $selectedToolIds->contains($id)
        );

        // Update toolbag
        $toolbag->update([
            'name' => $validated['name'],
            'notes' => $validated['notes'],
            'type' => $validated['type'],
            'employee_id' => $validated['employee_id'],
            'complete' => $isComplete,
        ]);

        return redirect()->route('toolbags.index')
            ->with('success', 'Toolbag updated.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Toolbag $toolbag )
    {
        $toolbag->delete();

        return redirect()->route('toolbags.index');
    }

    public function assign(Request $request, Toolbag $toolbag)
    {
        $request->validate([
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        $toolbag->update([
            'employee_id' => $request->employee_id
        ]);

        return back()->with('success', 'Toolbag updated');
    }

}
