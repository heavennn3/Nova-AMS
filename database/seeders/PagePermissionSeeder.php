<?php

namespace Database\Seeders;

use App\Models\PagePermission;
use Illuminate\Database\Seeder;

class PagePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            // Asset Inventory Module
            ['name' => 'assets', 'route' => '/assets', 'description' => 'Asset management', 'module' => 'module.asset-inventory'],
            ['name' => 'licenses', 'route' => '/licenses', 'description' => 'Software licenses', 'module' => 'module.asset-inventory'],
            ['name' => 'live-tracking', 'route' => '/live-tracking', 'description' => 'Live asset tracking', 'module' => 'module.asset-inventory'],
            ['name' => 'withdrawals', 'route' => '/withdrawals', 'description' => 'Asset withdrawals', 'module' => 'module.asset-inventory'],

            // Master Data Module
            ['name' => 'master-data', 'route' => '/master-data', 'description' => 'Master data management', 'module' => 'module.master-data'],
            ['name' => 'vendors', 'route' => '/vendors', 'description' => 'Vendor management', 'module' => 'module.master-data'],

            // Multi-Site Module
            ['name' => 'multi-site-tracking', 'route' => '/multi-site/tracking', 'description' => 'Multi-site tracking', 'module' => 'module.multi-site'],
            ['name' => 'multi-site-dashboards', 'route' => '/multi-site/dashboards', 'description' => 'Multi-site dashboards', 'module' => 'module.multi-site'],
            ['name' => 'multi-site-transfers', 'route' => '/multi-site/transfers', 'description' => 'Multi-site transfers', 'module' => 'module.multi-site'],
            ['name' => 'multi-site-access', 'route' => '/multi-site/access', 'description' => 'Multi-site access', 'module' => 'module.multi-site'],

            // Operations Module
            ['name' => 'operations-maintenance', 'route' => '/operations-maintanance', 'description' => 'Operations & maintenance', 'module' => 'module.operations'],
            ['name' => 'spare-parts', 'route' => '/spare-parts', 'description' => 'Spare parts management', 'module' => 'module.operations'],

            // Analytics Module
            ['name' => 'analytics-utilization', 'route' => '/analytics/utilization', 'description' => 'Asset utilization analytics', 'module' => 'module.analytics'],
            ['name' => 'analytics-costs', 'route' => '/analytics/costs', 'description' => 'Cost analytics', 'module' => 'module.analytics'],
            ['name' => 'analytics-availability', 'route' => '/analytics/availability', 'description' => 'Availability analytics', 'module' => 'module.analytics'],

            // Finance Module
            ['name' => 'finance-valuation', 'route' => '/finance/valuation', 'description' => 'Asset valuation', 'module' => 'module.finance'],
            ['name' => 'finance-budgets', 'route' => '/finance/budgets', 'description' => 'Budget management', 'module' => 'module.finance'],

            // Documents Module
            ['name' => 'documents-assets', 'route' => '/documents/assets', 'description' => 'Asset documents', 'module' => 'module.documents'],
            ['name' => 'documents-maintenance', 'route' => '/documents/maintenance', 'description' => 'Maintenance documents', 'module' => 'module.documents'],

            // System Settings Module
            ['name' => 'settings', 'route' => '/settings', 'description' => 'System settings', 'module' => 'module.system-settings'],
            ['name' => 'admin-sites', 'route' => '/admin/sites', 'description' => 'Site administration', 'module' => 'module.system-settings'],
            ['name' => 'security-roles', 'route' => '/security/roles', 'description' => 'Role management', 'module' => 'module.system-settings'],
            ['name' => 'security-logs', 'route' => '/security/logs', 'description' => 'Security logs', 'module' => 'module.system-settings'],
            ['name' => 'users', 'route' => '/users', 'description' => 'User management', 'module' => 'module.system-settings'],
            ['name' => 'settings-categories', 'route' => '/settings/categories', 'description' => 'Category settings', 'module' => 'module.system-settings'],
            ['name' => 'settings-manufacturers', 'route' => '/settings/manufacturers', 'description' => 'Manufacturer settings', 'module' => 'module.system-settings'],
            ['name' => 'settings-departments', 'route' => '/settings/departments', 'description' => 'Department settings', 'module' => 'module.system-settings'],
        ];

        foreach ($pages as $page) {
            PagePermission::firstOrCreate(
                ['name' => $page['name']],
                [
                    'route' => $page['route'],
                    'description' => $page['description'],
                    'module' => $page['module'],
                    'active' => true,
                ]
            );
        }
    }
}