<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('projects/index', [
            'projects' => Project::query()->latest('id')->get()->map(
                fn (Project $project): array => $this->projectData($project),
            ),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('projects/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveProjectRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $imagePath = $this->storeImage($request->file('laptop_image'));
        $mobileImagePath = $this->storeImage($request->file('mobile_image'));

        Project::create([
            'title' => $validated['title'],
            'image_path' => $imagePath,
            'mobile_image_path' => $mobileImagePath,
            'link' => $validated['link'] ?? null,
        ]);

        return to_route('projects.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project): Response
    {
        return Inertia::render('projects/edit', [
            'project' => $this->projectData($project),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaveProjectRequest $request, Project $project): RedirectResponse
    {
        $validated = $request->validated();
        $oldImagePath = $project->image_path;
        $oldMobileImagePath = $project->mobile_image_path;
        $imagePath = $request->hasFile('laptop_image')
            ? $this->storeImage($request->file('laptop_image'))
            : $oldImagePath;
        $mobileImagePath = $request->hasFile('mobile_image')
            ? $this->storeImage($request->file('mobile_image'))
            : $oldMobileImagePath;

        $project->update([
            'title' => $validated['title'],
            'image_path' => $imagePath,
            'mobile_image_path' => $mobileImagePath,
            'link' => $validated['link'] ?? null,
        ]);

        if ($imagePath !== $oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }
        if ($mobileImagePath !== $oldMobileImagePath && $oldMobileImagePath) {
            Storage::disk('public')->delete($oldMobileImagePath);
        }

        return to_route('projects.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $imagePath = $project->image_path;
        $mobileImagePath = $project->mobile_image_path;
        $project->delete();
        Storage::disk('public')->delete($imagePath);
        if ($mobileImagePath) {
            Storage::disk('public')->delete($mobileImagePath);
        }

        return to_route('projects.index');
    }

    /**
     * @return array{id: int, title: string, laptopImageUrl: string, mobileImageUrl: string, link: string|null}
     */
    private function projectData(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'laptopImageUrl' => Storage::disk('public')->url($project->image_path),
            'mobileImageUrl' => Storage::disk('public')->url($project->mobile_image_path ?? $project->image_path),
            'link' => $project->link,
        ];
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('projects', 'public');

        if (! is_string($path)) {
            throw new \RuntimeException('The project image could not be stored.');
        }

        return $path;
    }
}
