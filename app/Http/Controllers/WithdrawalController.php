<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index()
    {
        $withdrawals = Withdrawal::with(['asset', 'user', 'approver'])
            ->latest()
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'asset_name' => $withdrawal->asset?->product_name ?? 'Unknown',
                    'asset_id' => $withdrawal->asset?->asset_id ?? 'N/A',
                    'user_name' => $withdrawal->user?->name ?? 'Unknown',
                    'user_email' => $withdrawal->user?->email ?? '',
                    'withdrawal_type' => $withdrawal->withdrawal_type,
                    'purpose_category' => $withdrawal->purpose_category,
                    'purpose_description' => $withdrawal->purpose_description,
                    'withdrawal_date' => $withdrawal->withdrawal_date?->format('Y-m-d'),
                    'expected_return_date' => $withdrawal->expected_return_date?->format('Y-m-d'),
                    'actual_return_date' => $withdrawal->actual_return_date?->format('Y-m-d'),
                    'duration' => $withdrawal->human_duration,
                    'status' => $withdrawal->status,
                    'is_overdue' => $withdrawal->is_overdue,
                    'priority' => $withdrawal->priority,
                ];
            });

        return Inertia::render('Withdrawals/Index', [
            'withdrawals' => $withdrawals,
        ]);
    }

    public function create()
    {
        $availableAssets = Asset::where('status', 'available')
            ->orWhere('status', 'in_use')
            ->with(['site', 'category'])
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'asset_id' => $asset->asset_id,
                    'product_name' => $asset->product_name,
                    'category' => $asset->category?->name ?? '',
                    'site' => $asset->site?->name ?? '',
                    'current_status' => $asset->status,
                    'available' => in_array($asset->status, ['available', 'ready']),
                ];
            });

        return Inertia::render('Withdrawals/Create', [
            'assets' => $availableAssets,
            'typeOptions' => Withdrawal::getTypeOptions(),
            'purposeOptions' => Withdrawal::getPurposeOptions(),
            'durationPresets' => Withdrawal::getDurationPresets(),
            'priorityOptions' => Withdrawal::getPriorityOptions(),
            'currentUser' => auth()->user(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'withdrawal_type' => 'required|string|in:' . implode(',', array_keys(Withdrawal::getTypeOptions())),
            'purpose_category' => 'required|string|in:' . implode(',', array_keys(Withdrawal::getPurposeOptions())),
            'purpose_description' => 'required|string|min:10|max:500',
            'withdrawal_date' => 'required|date|after_or_equal:today',
            'duration_preset' => 'nullable|string',
            'expected_return_date' => 'nullable|date|after:withdrawal_date',
            'priority' => 'required|string|in:' . implode(',', array_keys(Withdrawal::getPriorityOptions())),
            'condition_notes' => 'nullable|string|max:500',
        ]);

        // Calculate expected return date based on preset
        if (isset($validated['duration_preset']) && $validated['duration_preset']) {
            $preset = Withdrawal::getDurationPresets()[$validated['duration_preset']] ?? null;
            if ($preset && $preset['days']) {
                $validated['expected_return_date'] = now()->addDays($preset['days'])->format('Y-m-d');
                $validated['duration'] = $preset['label'];
            } elseif ($validated['duration_preset'] === 'permanent') {
                $validated['expected_return_date'] = null;
                $validated['duration'] = 'Permanent';
            }
        }

        // Set user to currently authenticated user
        $validated['user_id'] = auth()->id();
        $validated['status'] = Withdrawal::STATUS_ACTIVE;

        // Auto-approve for standard withdrawals
        if ($validated['withdrawal_type'] === Withdrawal::TYPE_STANDARD) {
            $validated['approved_by'] = auth()->id();
            $validated['approved_at'] = now();
        }

        // Create withdrawal record
        $withdrawal = Withdrawal::create($validated);

        // Update asset status
        $asset = Asset::find($validated['asset_id']);
        if ($asset) {
            $asset->update(['status' => 'in_use']);
        }

        return redirect()->route('withdrawals.index')
            ->with('success', 'Asset withdrawal created successfully.');
    }

    public function show(Withdrawal $withdrawal)
    {
        $withdrawal->load(['asset', 'user', 'approver']);

        return Inertia::render('Withdrawals/Show', [
            'withdrawal' => $withdrawal,
            'canEdit' => auth()->id() === $withdrawal->user_id || auth()->user()->hasRole('Admin'),
            'canApprove' => auth()->user()->hasRole('Admin'),
        ]);
    }

    public function update(Request $request, Withdrawal $withdrawal)
    {
        $validated = $request->validate([
            'expected_return_date' => 'nullable|date|after:withdrawal_date',
            'priority' => 'required|string|in:' . implode(',', array_keys(Withdrawal::getPriorityOptions())),
            'admin_notes' => 'nullable|string',
        ]);

        $withdrawal->update($validated);

        return redirect()->back()->with('success', 'Withdrawal updated successfully.');
    }

    public function returnAsset(Request $request, Withdrawal $withdrawal)
    {
        $validated = $request->validate([
            'return_condition' => 'required|string|in:excellent,good,fair,poor,damaged',
            'condition_notes' => 'nullable|string|max:500',
        ]);

        // Update withdrawal
        $withdrawal->update([
            'actual_return_date' => now(),
            'status' => Withdrawal::STATUS_RETURNED,
            'return_condition' => $validated['return_condition'],
            'condition_notes' => $validated['condition_notes'],
        ]);

        // Update asset status back to available
        $asset = $withdrawal->asset;
        if ($asset) {
            $newStatus = $validated['return_condition'] === 'damaged'
                ? 'faulty'
                : 'available';
            $asset->update(['status' => $newStatus]);
        }

        return redirect()->back()->with('success', 'Asset returned successfully.');
    }

    public function approve(Request $request, Withdrawal $withdrawal)
    {
        $withdrawal->update([
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'status' => Withdrawal::STATUS_ACTIVE,
        ]);

        // Update asset status
        $asset = $withdrawal->asset;
        if ($asset) {
            $asset->update(['status' => 'in_use']);
        }

        return redirect()->back()->with('success', 'Withdrawal approved successfully.');
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        $withdrawal->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return redirect()->back()->with('success', 'Withdrawal rejected.');
    }

    public function destroy(Withdrawal $withdrawal)
    {
        // Only allow deletion of own withdrawals or by admins
        if (auth()->id() !== $withdrawal->user_id && !auth()->user()->hasRole('Admin')) {
            return redirect()->back()->with('error', 'You cannot delete this withdrawal.');
        }

        // Return asset to available status if withdrawal was active
        if ($withdrawal->status === Withdrawal::STATUS_ACTIVE) {
            $asset = $withdrawal->asset;
            if ($asset) {
                $asset->update(['status' => 'available']);
            }
        }

        $withdrawal->delete();

        return redirect()->back()->with('success', 'Withdrawal deleted successfully.');
    }

    public function dashboard()
    {
        $totalWithdrawals = Withdrawal::count();
        $activeWithdrawals = Withdrawal::active()->count();
        $overdueWithdrawals = Withdrawal::overdue()->count();
        $myWithdrawals = Withdrawal::byUser(auth()->id())->count();

        // Recent withdrawals
        $recentWithdrawals = Withdrawal::with(['asset', 'user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'asset_name' => $withdrawal->asset?->product_name ?? 'Unknown',
                    'user_name' => $withdrawal->user?->name ?? 'Unknown',
                    'withdrawal_date' => $withdrawal->withdrawal_date?->format('Y-m-d'),
                    'expected_return_date' => $withdrawal->expected_return_date?->format('Y-m-d'),
                    'status' => $withdrawal->status,
                    'is_overdue' => $withdrawal->is_overdue,
                ];
            });

        // Overdue alerts
        $overdueAlerts = Withdrawal::with(['asset', 'user'])
            ->overdue()
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'asset_name' => $withdrawal->asset?->product_name ?? 'Unknown',
                    'user_name' => $withdrawal->user?->name ?? 'Unknown',
                    'expected_return_date' => $withdrawal->expected_return_date?->format('Y-m-d'),
                    'days_overdue' => $withdrawal->expected_return_date
                        ? now()->diffInDays(\Carbon\Carbon::parse($withdrawal->expected_return_date))
                        : 0,
                ];
            });

        return Inertia::render('Withdrawals/Dashboard', [
            'totalWithdrawals' => $totalWithdrawals,
            'activeWithdrawals' => $activeWithdrawals,
            'overdueWithdrawals' => $overdueWithdrawals,
            'myWithdrawals' => $myWithdrawals,
            'recentWithdrawals' => $recentWithdrawals,
            'overdueAlerts' => $overdueAlerts,
        ]);
    }
}
