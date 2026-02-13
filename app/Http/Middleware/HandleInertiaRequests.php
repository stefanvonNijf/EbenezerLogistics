<?php

namespace App\Http\Middleware;

use App\Models\Checkin;
use App\Models\Tool;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $alertCount = 0;
        if ($request->user()) {
            $alertCount = Checkin::whereIn('status', ['planned_checkin', 'planned_checkout'])->count()
                + Tool::whereNotNull('minimal_stock')->whereColumn('amount_in_stock', '<=', 'minimal_stock')->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'dashboardAlertCount' => $alertCount,
        ];
    }
}
