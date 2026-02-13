<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            'categories' => Category::orderBy('name')->get(),
            'roles' => Role::orderBy('name')->get(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name',
        ]);

        Category::create($validated);

        return redirect()->route('settings.index');
    }

    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return redirect()->route('settings.index');
    }

    public function destroyCategory(Category $category)
    {
        $category->delete();

        return redirect()->route('settings.index');
    }

    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        Role::create($validated);

        return redirect()->route('settings.index');
    }

    public function updateRole(Request $request, Role $role)
    {
        $oldName = $role->name;

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
        ]);

        $role->update($validated);

        // Update all references to the old role name
        \App\Models\Employee::where('role', $oldName)->update(['role' => $validated['name']]);
        \App\Models\Toolbag::where('type', $oldName)->update(['type' => $validated['name']]);
        \App\Models\Tool::where('roletype', $oldName)->update(['roletype' => $validated['name']]);

        return redirect()->route('settings.index');
    }

    public function destroyRole(Role $role)
    {
        $role->delete();

        return redirect()->route('settings.index');
    }
}
