<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class StoreLicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'version' => 'nullable|string',
            'category' => 'nullable|string',
            'license_type' => 'required|in:per_user,per_device,concurrent,subscription,perpetual',
            'pricing_model' => 'required|in:one_time,annual,monthly,quarterly',
            'total_seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'support_expiry' => 'nullable|date',
            'renewal_date' => 'nullable|date',
            'auto_renew' => 'boolean',
            'billing_cycle' => 'nullable|in:monthly,quarterly,annual,custom',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ];
    }
}
