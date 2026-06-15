<?php

use App\Models\User;
use App\Models\Asset;
use App\Models\WorkOrder;
use App\Models\AssetCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

test('authenticated users can bulk delete assets', function () {
    $user = User::factory()->create(['is_active' => true]);
    $this->actingAs($user);

    // Let's create two assets directly (without factory)
    $asset1 = Asset::create([
        'asset_id' => 'ATM-' . uniqid(),
        'status' => 'available',
    ]);
    $asset2 = Asset::create([
        'asset_id' => 'ATM-' . uniqid(),
        'status' => 'available',
    ]);

    $response = $this->postJson('/api/quick/bulk-delete', [
        'type' => 'assets',
        'ids' => [$asset1->id, $asset2->id]
    ]);

    $response->assertOk();
    $response->assertJson([
        'message' => 'Successfully deleted 2 records!',
        'count' => 2
    ]);

    // Since assets have SoftDeletes, assert they are soft deleted
    $this->assertSoftDeleted('assets', ['id' => $asset1->id]);
    $this->assertSoftDeleted('assets', ['id' => $asset2->id]);
});

test('authenticated users can bulk update asset status', function () {
    $user = User::factory()->create(['is_active' => true]);
    $this->actingAs($user);

    $asset1 = Asset::create([
        'asset_id' => 'ATM-' . uniqid(),
        'status' => 'available',
    ]);
    $asset2 = Asset::create([
        'asset_id' => 'ATM-' . uniqid(),
        'status' => 'available',
    ]);

    $response = $this->postJson('/api/quick/bulk-status', [
        'type' => 'assets',
        'ids' => [$asset1->id, $asset2->id],
        'status' => 'maintenance'
    ]);

    $response->assertOk();
    $response->assertJson([
        'message' => 'Successfully updated status of 2 records!',
        'count' => 2
    ]);

    $this->assertDatabaseHas('assets', ['id' => $asset1->id, 'status' => 'maintenance']);
    $this->assertDatabaseHas('assets', ['id' => $asset2->id, 'status' => 'maintenance']);
});

test('authenticated users can bulk update work order status', function () {
    $user = User::factory()->create(['is_active' => true]);
    $this->actingAs($user);

    $asset1 = Asset::create([
        'asset_id' => 'ATM-' . uniqid(),
        'status' => 'available',
    ]);

    $wo1 = WorkOrder::create([
        'asset_id' => $asset1->id,
        'title' => 'WO 1',
        'description' => 'Desc 1',
        'status' => 'open',
        'priority' => 'medium',
    ]);
    $wo2 = WorkOrder::create([
        'asset_id' => $asset1->id,
        'title' => 'WO 2',
        'description' => 'Desc 2',
        'status' => 'open',
        'priority' => 'medium',
    ]);

    $response = $this->postJson('/api/quick/bulk-status', [
        'type' => 'work-orders',
        'ids' => [$wo1->id, $wo2->id],
        'status' => 'completed'
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('work_orders', ['id' => $wo1->id, 'status' => 'completed']);
    $this->assertDatabaseHas('work_orders', ['id' => $wo2->id, 'status' => 'completed']);
});

test('authenticated users can bulk activate/deactivate users', function () {
    $admin = User::factory()->create(['is_active' => true]);
    $this->actingAs($admin);

    $u1 = User::factory()->create(['is_active' => true]);
    $u2 = User::factory()->create(['is_active' => true]);

    $response = $this->postJson('/api/quick/bulk-status', [
        'type' => 'users',
        'ids' => [$u1->id, $u2->id],
        'status' => 'deactivated'
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('users', ['id' => $u1->id, 'is_active' => false]);
    $this->assertDatabaseHas('users', ['id' => $u2->id, 'is_active' => false]);

    // Test activation
    $response2 = $this->postJson('/api/quick/bulk-status', [
        'type' => 'users',
        'ids' => [$u1->id, $u2->id],
        'status' => 'active'
    ]);

    $response2->assertOk();
    $this->assertDatabaseHas('users', ['id' => $u1->id, 'is_active' => true]);
    $this->assertDatabaseHas('users', ['id' => $u2->id, 'is_active' => true]);
});
