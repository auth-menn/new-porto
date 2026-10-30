<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveMenuImageRequest;
use App\Models\MenuImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MenuImageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('menu-images/index', [
            'images' => MenuImage::query()->oldest('id')->get()
                ->map(fn (MenuImage $image): array => $this->imageData($image)),
        ]);
    }

    public function store(SaveMenuImageRequest $request): RedirectResponse
    {
        foreach ($request->file('images') as $image) {
            MenuImage::query()->create([
                'side' => $request->validated('side'),
                'image_path' => $this->storeImage($image),
            ]);
        }

        return to_route('menu-images.index');
    }

    public function update(SaveMenuImageRequest $request, MenuImage $menuImage): RedirectResponse
    {
        $oldImagePath = $menuImage->image_path;
        $imagePath = $this->storeImage($request->file('image'));

        $menuImage->update([
            'side' => $request->validated('side'),
            'image_path' => $imagePath,
        ]);

        Storage::disk('public')->delete($oldImagePath);

        return to_route('menu-images.index');
    }

    public function destroy(MenuImage $menuImage): RedirectResponse
    {
        $imagePath = $menuImage->image_path;
        $menuImage->delete();
        Storage::disk('public')->delete($imagePath);

        return to_route('menu-images.index');
    }

    /**
     * @return array{id: int, side: string, imageUrl: string}
     */
    private function imageData(MenuImage $image): array
    {
        return [
            'id' => $image->id,
            'side' => $image->side,
            'imageUrl' => Storage::disk('public')->url($image->image_path),
        ];
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('menu-images', 'public');

        if (! is_string($path)) {
            throw new \RuntimeException('The menu image could not be stored.');
        }

        return $path;
    }
}
