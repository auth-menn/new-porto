<?php

use App\Http\Controllers\JourneyController;
use App\Http\Controllers\MenuImageController;
use App\Http\Controllers\ProjectController;
use App\Models\Journey;
use App\Models\MenuImage;
use App\Models\Project;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

Route::get('/', function (): InertiaResponse {
    $menuImages = MenuImage::query()->oldest('id')->get()->groupBy('side');

    return Inertia::render('home', [
        'projects' => Project::query()->oldest('id')->get()->map(
            fn (Project $project): array => [
                'id' => $project->id,
                'title' => $project->title,
                'laptopImageUrl' => Storage::disk('public')->url($project->image_path),
                'mobileImageUrl' => Storage::disk('public')->url($project->mobile_image_path ?? $project->image_path),
                'link' => $project->link,
            ],
        ),
        'journeys' => Journey::query()->orderBy('start_year')->orderBy('id')->get()->map(
            fn (Journey $journey): array => [
                'id' => $journey->id,
                'category' => $journey->category,
                'organization' => $journey->organization,
                'title' => $journey->title,
                'logoUrl' => $journey->logo_path
                    ? Storage::disk('public')->url($journey->logo_path)
                    : null,
                'startYear' => $journey->start_year,
                'endYear' => $journey->end_year,
                'activities' => $journey->activities,
                'documentationUrl' => $journey->documentation_path
                    ? Storage::disk('public')->url($journey->documentation_path)
                    : null,
            ],
        ),
        'menuImages' => [
            'left' => $menuImages->get('left', collect())->map(
                fn (MenuImage $image): array => [
                    'id' => $image->id,
                    'imageUrl' => Storage::disk('public')->url($image->image_path),
                ],
            )->values(),
            'right' => $menuImages->get('right', collect())->map(
                fn (MenuImage $image): array => [
                    'id' => $image->id,
                    'imageUrl' => Storage::disk('public')->url($image->image_path),
                ],
            )->values(),
        ],
    ]);
})->name('home');

Route::get('secret-cms-login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

Route::post('secret-cms-login', [AuthenticatedSessionController::class, 'store'])
    ->middleware(['guest', 'throttle:login'])
    ->name('login.store');

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('projects', ProjectController::class)->except('show');
    Route::resource('journeys', JourneyController::class)->except('show');
    Route::resource('menu-images', MenuImageController::class)->only(['index', 'store', 'update', 'destroy']);
});
