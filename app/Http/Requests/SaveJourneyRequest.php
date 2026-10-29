<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveJourneyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'in:education,internship,workExperience'],
            'organization' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'start_year' => ['required', 'integer', 'between:1900,2100'],
            'end_year' => ['nullable', 'integer', 'between:1900,2100', 'after_or_equal:start_year'],
            'activities' => ['required', 'array', 'min:1', 'max:8'],
            'activities.*' => ['required', 'string', 'max:500'],
            'logo_image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'documentation_image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ];
    }
}
