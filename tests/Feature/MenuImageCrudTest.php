<?php

use App\Models\MenuImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access menu image management', function () {
    $this->get(route('menu-images.index'))->assertRedirect(route('login'));
});

test('authenticated users can add images to either menu card column', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('menu-images.store'), [
        'side' => 'left',
        'image' => null,
        'images' => [
            UploadedFile::fake()->image('left-one.png'),
            UploadedFile::fake()->image('left-two.png'),
        ],
    ])->assertRedirect(route('menu-images.index'));
    $this->actingAs($user)->post(route('menu-images.store'), [
        'side' => 'right',
        'image' => null,
        'images' => [
            UploadedFile::fake()->image('right-one.png'),
            UploadedFile::fake()->image('right-two.png'),
        ],
    ])->assertRedirect(route('menu-images.index'));

    expect(MenuImage::query()->where('side', 'left')->count())->toBe(2)
        ->and(MenuImage::query()->where('side', 'right')->count())->toBe(2);
    $leftImages = MenuImage::query()->where('side', 'left')->oldest('id')->get();
    $rightImages = MenuImage::query()->where('side', 'right')->oldest('id')->get();
    $leftImages->each(fn (MenuImage $image) => Storage::disk('public')->assertExists($image->image_path));
    $rightImages->each(fn (MenuImage $image) => Storage::disk('public')->assertExists($image->image_path));

    $this->actingAs($user)->get(route('menu-images.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('menu-images/index')
            ->has('images', 4)
            ->where('images.0.side', 'left')
            ->where('images.2.side', 'right'));

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('menuImages.left.0.imageUrl', Storage::disk('public')->url($leftImages[0]->image_path))
            ->where('menuImages.left.1.imageUrl', Storage::disk('public')->url($leftImages[1]->image_path))
            ->where('menuImages.right.0.imageUrl', Storage::disk('public')->url($rightImages[0]->image_path))
            ->where('menuImages.right.1.imageUrl', Storage::disk('public')->url($rightImages[1]->image_path)));
});

test('authenticated users can replace a menu image and change its column', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $oldPath = UploadedFile::fake()->image('old.png')->store('menu-images', 'public');
    $image = MenuImage::query()->create(['side' => 'left', 'image_path' => $oldPath]);

    $this->actingAs($user)->put(route('menu-images.update', $image), [
        'side' => 'right',
        'image' => UploadedFile::fake()->image('replacement.png'),
    ])->assertRedirect(route('menu-images.index'));

    expect($image->fresh()->side)->toBe('right')
        ->and($image->fresh()->image_path)->not->toBe($oldPath);
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($image->fresh()->image_path);
});

test('menu image uploads reject invalid files and invalid columns', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('menu-images.store'), [
        'side' => 'center',
        'image' => null,
        'images' => [UploadedFile::fake()->create('not-an-image.txt', 10, 'text/plain')],
    ])->assertSessionHasErrors(['side', 'images.0']);

    expect(MenuImage::query()->count())->toBe(0);
});

test('authenticated users can delete a menu image and its file', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $path = UploadedFile::fake()->image('menu.png')->store('menu-images', 'public');
    $image = MenuImage::query()->create(['side' => 'right', 'image_path' => $path]);

    $this->actingAs($user)->delete(route('menu-images.destroy', $image))
        ->assertRedirect(route('menu-images.index'));

    expect(MenuImage::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing($path);
});
