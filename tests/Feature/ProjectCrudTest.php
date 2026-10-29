<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access project management', function () {
    $this->get(route('projects.index'))->assertRedirect(route('login'));
});

test('authenticated users can create a project with required device images and an optional link', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('projects.store'), [
        'title' => 'Portfolio site',
        'laptop_image' => UploadedFile::fake()->image('portfolio-laptop.png'),
        'mobile_image' => UploadedFile::fake()->image('portfolio-mobile.png'),
        'link' => '',
    ])->assertRedirect(route('projects.index'));

    $project = Project::query()->sole();
    expect($project->title)->toBe('Portfolio site')
        ->and($project->link)->toBeNull();
    Storage::disk('public')->assertExists($project->image_path);
    Storage::disk('public')->assertExists($project->mobile_image_path);
});

test('both device images are required when creating a project', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('projects.store'), [
        'title' => 'Portfolio site',
        'link' => 'https://example.test',
    ])->assertSessionHasErrors(['laptop_image', 'mobile_image']);

    expect(Project::query()->count())->toBe(0);
});

test('project updates retain or replace images and deletion removes the image', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'image_path' => 'projects/old-laptop.webp',
        'mobile_image_path' => 'projects/old-mobile.webp',
    ]);
    Storage::disk('public')->put($project->image_path, 'old image');
    Storage::disk('public')->put($project->mobile_image_path, 'old image');

    $this->actingAs($user)->put(route('projects.update', $project), [
        'title' => 'Updated project',
        'link' => 'https://example.test',
    ])->assertRedirect(route('projects.index'));
    expect($project->fresh()->image_path)->toBe('projects/old-laptop.webp')
        ->and($project->fresh()->mobile_image_path)->toBe('projects/old-mobile.webp');

    $this->actingAs($user)->put(route('projects.update', $project), [
        'title' => 'Updated project',
        'link' => '',
        'laptop_image' => UploadedFile::fake()->image('new-laptop.png'),
        'mobile_image' => UploadedFile::fake()->image('new-mobile.png'),
    ])->assertRedirect(route('projects.index'));

    $project->refresh();
    expect($project->image_path)->not->toBe('projects/old-laptop.webp')
        ->and($project->mobile_image_path)->not->toBe('projects/old-mobile.webp')
        ->and($project->link)->toBeNull();
    Storage::disk('public')->assertMissing('projects/old-laptop.webp');
    Storage::disk('public')->assertMissing('projects/old-mobile.webp');
    Storage::disk('public')->assertExists($project->image_path);
    Storage::disk('public')->assertExists($project->mobile_image_path);

    $this->actingAs($user)->delete(route('projects.destroy', $project))
        ->assertRedirect(route('projects.index'));
    expect(Project::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing($project->image_path);
    Storage::disk('public')->assertMissing($project->mobile_image_path);
});

test('the public homepage uses projects stored in the cms', function () {
    Storage::fake('public');
    $project = Project::factory()->create(['title' => 'CMS project']);

    $this->get(route('home'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->has('projects', 1)
        ->where('projects.0.title', 'CMS project')
        ->where('projects.0.laptopImageUrl', Storage::disk('public')->url($project->image_path))
        ->where('projects.0.mobileImageUrl', Storage::disk('public')->url($project->mobile_image_path)));
});
