<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::all();

        return Inertia::render('UserManagement/Index', ['users' => $users]);
    }

    public function create()
    {
        return Inertia::render('UserManagement/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:admin,user',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('UserManagement/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        // Prevent admin from demoting themselves
        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            return back()->withErrors(['role' => 'You cannot demote yourself.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:admin,user',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('users.index');
    }

    public function destroy(Request $request, User $user)
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete yourself.']);
        }

        // Prevent deleting the last admin
        if ($user->isAdmin() && User::where('role', 'admin')->count() <= 1) {
            return back()->withErrors(['user' => 'Cannot delete the last admin.']);
        }

        $user->delete();

        return redirect()->route('users.index');
    }
}
