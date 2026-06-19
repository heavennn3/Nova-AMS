<?php

use App\Models\User;
use App\Models\SparePart;
use App\Models\AssetType;
use App\Models\AssetCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can create a spare part with an asset type association', function () {
    $this->seed(\Database\Seeders\RolesAndSitesSeeder::class);
    $user = User::factory()->create(['is_active' => true]);
    $user->givePermissionTo('module.operations');
    $this->actingAs($user);

    $category = AssetCategory::create(['name' => 'Hardware']);
    $assetType = AssetType::create([
        'name' => 'SERVER',
        'category_id' => $category->id,
    ]);

    $response = $this->post('/maintenance/parts', [
        'part_number' => 'SP-SERVER-001',
        'name' => 'Xeon CPU Intel',
        'stock_level' => 5,
        'minimum_stock_level' => 2,
        'unit_cost' => 500.00,
        'asset_type_id' => $assetType->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('spare_parts', [
        'part_number' => 'SP-SERVER-001',
        'asset_type_id' => $assetType->id,
    ]);
});

test('user can update a spare part asset type association', function () {
    $this->seed(\Database\Seeders\RolesAndSitesSeeder::class);
    $user = User::factory()->create(['is_active' => true]);
    $user->givePermissionTo('module.operations');
    $this->actingAs($user);

    $category = AssetCategory::create(['name' => 'Hardware']);
    $assetType1 = AssetType::create([
        'name' => 'SERVER',
        'category_id' => $category->id,
    ]);
    $assetType2 = AssetType::create([
        'name' => 'WORKSTATION',
        'category_id' => $category->id,
    ]);

    $part = SparePart::create([
        'part_number' => 'SP-002',
        'name' => 'DDR4 RAM',
        'stock_level' => 10,
        'minimum_stock_level' => 5,
        'unit_cost' => 80.00,
        'asset_type_id' => $assetType1->id,
    ]);

    $response = $this->put("/maintenance/parts/{$part->id}", [
        'part_number' => 'SP-002',
        'name' => 'DDR4 RAM Updated',
        'stock_level' => 12,
        'minimum_stock_level' => 5,
        'unit_cost' => 80.00,
        'asset_type_id' => $assetType2->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('spare_parts', [
        'id' => $part->id,
        'name' => 'DDR4 RAM Updated',
        'asset_type_id' => $assetType2->id,
    ]);
});

test('SparePartsSeeder does not seed mock fake data', function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\SparePartsSeeder']);

    // The seeder should execute successfully but not create any mock data
    // Real spare parts should be created through the admin interface
    $this->assertEquals(0, SparePart::count());
});
