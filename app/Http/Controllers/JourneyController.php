<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveJourneyRequest;
use App\Models\Journey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JourneyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('journeys/index', [
            'journeys' => Journey::query()->orderBy('start_year')->orderBy('id')->get()
                ->map(fn (Journey $journey): array => $this->journeyData($journey)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('journeys/create');
    }

    public function store(SaveJourneyRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $data = $this->validatedData($validated);
        $data['documentation_path'] = $request->hasFile('documentation_image')
            ? $this->storeImage($request->file('documentation_image'), 'journeys/documentation')
            : null;
        $data['logo_path'] = $request->hasFile('logo_image')
            ? $this->storeImage($request->file('logo_image'), 'journeys/logos')
            : null;

        Journey::create($data);

        return to_route('journeys.index');
    }

    public function show(Journey $journey): Response
    {
        return Inertia::render('journeys/index', [
            'journeys' => [$this->journeyData($journey)],
        ]);
    }

    public function edit(Journey $journey): Response
    {
        return Inertia::render('journeys/edit', [
            'journey' => $this->journeyData($journey),
        ]);
    }

    public function update(SaveJourneyRequest $request, Journey $journey): RedirectResponse
    {
        $validated = $request->validated();
        $oldImagePath = $journey->documentation_path;
        $oldLogoPath = $journey->logo_path;
        $imagePath = $request->hasFile('documentation_image')
            ? $this->storeImage($request->file('documentation_image'), 'journeys/documentation')
            : $oldImagePath;
        $logoPath = $request->hasFile('logo_image')
            ? $this->storeImage($request->file('logo_image'), 'journeys/logos')
            : $oldLogoPath;

        $journey->update([
            ...$this->validatedData($validated),
            'documentation_path' => $imagePath,
            'logo_path' => $logoPath,
        ]);

        if ($imagePath !== $oldImagePath && $oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }
        if ($logoPath !== $oldLogoPath && $oldLogoPath) {
            Storage::disk('public')->delete($oldLogoPath);
        }

        return to_route('journeys.index');
    }

    public function destroy(Journey $journey): RedirectResponse
    {
        $imagePath = $journey->documentation_path;
        $logoPath = $journey->logo_path;
        $journey->delete();

        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);
        }
        if ($logoPath) {
            Storage::disk('public')->delete($logoPath);
        }

        return to_route('journeys.index');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function validatedData(array $validated): array
    {
        return [
            'category' => $validated['category'],
            'organization' => $validated['organization'],
            'title' => $validated['title'],
            'logo_path' => null,
            'start_year' => $validated['start_year'],
            'end_year' => $validated['end_year'] ?? null,
            'activities' => $validated['activities'],
        ];
    }

    /**
     * @return array{id: int, category: string, organization: string, title: string, logoUrl: string|null, startYear: int, endYear: int|null, activities: array<int, string>, documentationUrl: string|null}
     */
    private function journeyData(Journey $journey): array
    {
        return [
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
        ];
    }

    private function storeImage(UploadedFile $image, string $directory): string
    {
        $path = $image->store($directory, 'public');

        if (! is_string($path)) {
            throw new \RuntimeException('The journey documentation image could not be stored.');
        }

        return $path;
    }
}
