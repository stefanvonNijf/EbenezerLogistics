# Laravel + Inertia + React — Page Cheatsheet

This project uses **Laravel** (backend), **Inertia.js** (bridge), and **React** (frontend).
There is no separate API. Laravel renders the first page; after that, Inertia intercepts clicks and swaps pages client-side without full reloads.

---

## The mental model

```
Browser request
  → routes/web.php         (which URL maps to which controller method)
  → Controller method      (fetch data, validate, return Inertia view)
  → resources/js/Pages/    (React component receives props, renders UI)
  → Form submit            (useForm posts to a Laravel route)
  → Controller validates   (errors bounce back, or redirect on success)
```

---

## 1. Routes (`routes/web.php`)

```php
// Single routes
Route::get('/things',          [ThingController::class, 'index'])->name('things.index');
Route::get('/things/create',   [ThingController::class, 'create'])->name('things.create');
Route::post('/things',         [ThingController::class, 'store'])->name('things.store');
Route::get('/things/{thing}',  [ThingController::class, 'show'])->name('things.show');
Route::get('/things/{thing}/edit', [ThingController::class, 'edit'])->name('things.edit');
Route::put('/things/{thing}',  [ThingController::class, 'update'])->name('things.update');
Route::delete('/things/{thing}', [ThingController::class, 'destroy'])->name('things.destroy');

// Shorthand for all of the above at once
Route::resource('things', ThingController::class);

// Extra non-CRUD route
Route::post('/things/{thing}/approve', [ThingController::class, 'approve'])->name('things.approve');
```

**Rules:**
- Always give routes a name — you reference that name everywhere else.
- Keep routes inside the `middleware('auth')` group so they require login.
- `Route::resource` creates: index, create, store, show, edit, update, destroy automatically.

---

## 2. Controller

```php
use Inertia\Inertia;

// Index — list page
public function index()
{
    return Inertia::render('Things/Index', [
        'things' => Thing::with('owner')->latest()->get(),
    ]);
}

// Create — show empty form
public function create()
{
    return Inertia::render('Things/Create', [
        'categories' => Category::all(),  // anything the form needs
    ]);
}

// Store — handle form submission
public function store(Request $request)
{
    $request->validate([
        'name'        => 'required|string|max:255',
        'category_id' => 'required|exists:categories,id',
        'notes'       => 'nullable|string',
        'tags'        => 'nullable|array',
        'tags.*'      => 'string|max:50',
    ]);

    Thing::create([
        'name'        => $request->name,
        'category_id' => $request->category_id,
        'notes'       => $request->notes,
        'tags'        => $request->tags ?? [],
    ]);

    return redirect()->route('things.index')->with('success', 'Thing created.');
}

// Edit — show prefilled form
public function edit(Thing $thing)
{
    return Inertia::render('Things/Edit', [
        'thing'      => $thing->load('owner'),
        'categories' => Category::all(),
    ]);
}

// Update — handle edit form submission
public function update(Request $request, Thing $thing)
{
    $request->validate([...]);

    $thing->update([...]);

    return redirect()->route('things.index')->with('success', 'Thing updated.');
}
```

**Returning errors manually (without validate):**
```php
return back()->withErrors(['field_name' => 'Error message.'])->withInput();
```

**Checklist for every store/update:**
- [ ] Validate every field you use from the request
- [ ] Only put fields in `create()`/`update()` that are in `$fillable` on the model
- [ ] Return a redirect on success, not another Inertia render

---

## 3. Model

```php
class Thing extends Model
{
    protected $fillable = [
        'name',
        'category_id',
        'notes',
        'tags',          // ← add every column you want mass-assignable
    ];

    protected $casts = [
        'tags'       => 'array',      // JSON column → PHP array automatically
        'is_active'  => 'boolean',
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
```

**Checklist when adding a column:**
- [ ] Migration (see section 4)
- [ ] Add to `$fillable`
- [ ] Add to `$casts` if it's JSON, boolean, or datetime

---

## 4. Migration

```bash
php artisan make:migration add_notes_to_things_table
php artisan migrate
```

```php
public function up(): void
{
    Schema::table('things', function (Blueprint $table) {
        $table->text('notes')->nullable()->after('name');
        $table->json('tags')->nullable()->after('notes');
        $table->foreignId('category_id')->nullable()->constrained()->after('tags');
    });
}

public function down(): void
{
    Schema::table('things', function (Blueprint $table) {
        $table->dropColumn(['notes', 'tags', 'category_id']);
    });
}
```

**Common column types:**
| Type | Laravel |
|---|---|
| Short text | `string('col')` |
| Long text | `text('col')` |
| Number | `integer('col')` or `unsignedInteger` |
| Decimal | `decimal('col', 8, 2)` |
| True/false | `boolean('col')` |
| JSON array | `json('col')` |
| Date only | `date('col')` |
| Date + time | `timestamp('col')` |
| Foreign key | `foreignId('user_id')->constrained()->cascadeOnDelete()` |

Add `->nullable()` when the field is optional. Add `->after('col')` to control column order.

---

## 5. React Page (`resources/js/Pages/`)

**Reading props the controller sent:**
```jsx
import { usePage } from '@inertiajs/react';

export default function Index() {
    const { things, categories } = usePage().props;

    return (
        <div>
            {things.map(t => <div key={t.id}>{t.name}</div>)}
        </div>
    );
}
```

**Navigation links:**
```jsx
import { Link } from '@inertiajs/react';

<Link href={route('things.create')}>New thing</Link>
<Link href={route('things.edit', thing.id)}>Edit</Link>
```

**Programmatic navigation:**
```jsx
import { router } from '@inertiajs/react';

router.delete(route('things.destroy', thing.id));
router.get(route('things.show', thing.id));
```

---

## 6. Forms with `useForm`

```jsx
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name:        '',
        category_id: '',
        notes:       '',
        tags:        [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('things.store'));
        // For edit: put(route('things.update', thing.id));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={data.name}
                onChange={e => setData('name', e.target.value)}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}

            <button type="submit" disabled={processing}>Save</button>
        </form>
    );
}
```

**Key rules:**
- Initial `useForm({...})` state must list **every field** you send to the server.
- `errors.fieldName` is automatically populated when Laravel returns validation errors.
- `processing` is `true` while the request is in flight — use it to disable the submit button.
- For file uploads, pass `{ forceFormData: true }` as second arg to `post()`.
- For edit pages, initialise `useForm` from the existing record: `name: thing.name || ''`.

---

## 7. Full checklist: adding a new field

When you want to add a field (e.g. `priority`) to an existing page:

1. **Migration** — `php artisan make:migration add_priority_to_things_table` → add column → `php artisan migrate`
2. **Model** — add `'priority'` to `$fillable`; add cast if needed
3. **Controller `store()`** — add validation rule; include in `Thing::create([...])`
4. **Controller `update()`** — add validation rule; include in `$thing->update([...])`
5. **Controller `create()`/`edit()`** — pass any extra data the field needs (e.g. a list of options)
6. **React `Create.jsx`** — add to `useForm({...})` initial state; add input + error display
7. **React `Edit.jsx`** — add to `useForm({...})` initialised from the record; add input + error display
8. **Email/PDF templates** — update if the field should appear in notifications or exports

---

## 8. Full checklist: creating a new page

1. **Migration + Model** — create the table and model
2. **Route** — add to `routes/web.php` inside the `auth` middleware group
3. **Controller method** — return `Inertia::render('Folder/Page', [props])`
4. **React page** — create `resources/js/Pages/Folder/Page.jsx`, wrap in `<AuthenticatedLayout>`
5. **Link to it** — add a `<Link>` or button somewhere in the UI

---

## 9. Common patterns in this project

**JSON columns (arrays stored in DB):**
```php
// Migration
$table->json('tags')->nullable();

// Model cast
'tags' => 'array',

// Controller — treat like a normal array
'tags' => $request->tags ?? [],
```

**Eager loading relationships** (avoids N+1 queries):
```php
// In controller — load before passing to view
Thing::with('owner', 'items')->get();
$thing->load('owner', 'items.category');
```

**Flash messages** (success/error displayed after redirect):
```php
return redirect()->route('things.index')->with('success', 'Saved.');
return redirect()->route('things.index')->with('error', 'Something went wrong.');
```

**Inertia `route()` in React** comes from `ziggy` — it uses the same route names defined in `web.php`.

**File/PDF pattern:**
- Generate with `Pdf::view('pdf.template', [...data])` in the controller
- Save to S3 with `Storage::disk('s3')->put($path, $content, 'public')`
- Serve with `redirect(Storage::disk('s3')->url($path))`

---

## 10. Quick reference — where things live

| What | Where |
|---|---|
| URL → controller mapping | `routes/web.php` |
| Backend logic, validation | `app/Http/Controllers/` |
| Database structure | `database/migrations/` |
| Data model + relationships | `app/Models/` |
| React pages (one per URL) | `resources/js/Pages/` |
| Shared React components | `resources/js/Components/` |
| Layouts | `resources/js/Layouts/` |
| Email templates | `resources/views/emails/` |
| PDF templates | `resources/views/pdf/` |
| Environment config | `.env` |
