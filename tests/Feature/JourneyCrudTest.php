<?php

use App\Models\Journey;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access journey management', function () {
    $this->get(route('journeys.index'))->assertRedirect(route('login'));
});

test('authenticated users can create journeys with card content and optional documentation', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('journeys.store'), [
        'category' => 'education',
        'organization' => 'Example University',
        'title' => 'Computer Science',
        'start_year' => '2022',
        'end_year' => '',
        'activities' => ['Studied software engineering', 'Joined development club'],
        'logo_image' => UploadedFile::fake()->image('university-logo.png'),
        'documentation_image' => UploadedFile::fake()->image('campus.png'),
    ])->assertRedirect(route('journeys.index'));

    $journey = Journey::query()->sole();
    expect($journey->category)->toBe('education')
        ->and($journey->activities)->toBe([
            'Studied software engineering',
            'Joined development club',
        ])
        ->and($journey->end_year)->toBeNull();
    Storage::disk('public')->assertExists($journey->documentation_path);
    Storage::disk('public')->assertExists($journey->logo_path);
});

test('journey input validates required fields and year range', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('journeys.store'), [
        'category' => 'other',
        'organization' => '',
        'title' => '',
        'start_year' => '2025',
        'end_year' => '2020',
        'activities' => [],
    ])->assertSessionHasErrors([
        'category',
        'organization',
        'title',
        'end_year',
        'activities',
    ]);

    expect(Journey::query()->count())->toBe(0);
});

test('journeys can be edited and deleted with their documentation file', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $journey = Journey::factory()->create([
        'documentation_path' => 'journeys/old.png',
        'logo_path' => 'journeys/old-logo.png',
    ]);
    Storage::disk('public')->put('journeys/old.png', 'old image');
    Storage::disk('public')->put('journeys/old-logo.png', 'old logo');

    $this->actingAs($user)->put(route('journeys.update', $journey), [
        'category' => 'internship',
        'organization' => 'Example Company',
        'title' => 'Developer Intern',
        'start_year' => '2024',
        'end_year' => '2025',
        'activities' => ['Built a website', 'Reviewed pull requests'],
        'documentation_image' => UploadedFile::fake()->image('internship.webp'),
        'logo_image' => UploadedFile::fake()->image('company-logo.png'),
    ])->assertRedirect(route('journeys.index'));

    $journey->refresh();
    expect($journey->category)->toBe('internship')
        ->and($journey->title)->toBe('Developer Intern')
        ->and($journey->activities)->toBe(['Built a website', 'Reviewed pull requests']);
    Storage::disk('public')->assertMissing('journeys/old.png');
    Storage::disk('public')->assertMissing('journeys/old-logo.png');
    Storage::disk('public')->assertExists($journey->documentation_path);
    Storage::disk('public')->assertExists($journey->logo_path);

    $imagePath = $journey->documentation_path;
    $logoPath = $journey->logo_path;
    $this->actingAs($user)->delete(route('journeys.destroy', $journey))
        ->assertRedirect(route('journeys.index'));
    expect(Journey::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing($imagePath);
    Storage::disk('public')->assertMissing($logoPath);
});

test('the public homepage receives journeys saved in the cms', function () {
    $journey = Journey::factory()->create([
        'organization' => 'CMS University',
        'activities' => ['Built an application'],
    ]);

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('journeys', 1)
        ->where('journeys.0.organization', 'CMS University')
        ->where('journeys.0.logoUrl', null)
        ->where('journeys.0.activities.0', 'Built an application'));
});
