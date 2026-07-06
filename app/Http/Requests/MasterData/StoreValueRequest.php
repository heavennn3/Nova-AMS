<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class StoreValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'custom_master_data_type_id' => 'required|exists:custom_master_data_types,id',
            'data' => 'required|array',
        ];
    }
}
