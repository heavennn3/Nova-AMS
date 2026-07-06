<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class UpdateColumnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'data_type' => 'required|in:text,number,date,boolean,select',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
        ];
    }
}
