<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LicenseType;
use Illuminate\Support\Str;

class LicenseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $licenseTypes = [
            [
                'name' => 'Windows Activation',
                'slug' => 'windows-activation',
                'description' => 'Microsoft Windows operating system licenses and activation keys',
                'icon' => 'windows',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Adobe Creative Cloud',
                'slug' => 'adobe-creative-cloud',
                'description' => 'Adobe Photoshop, Illustrator, InDesign, and other creative software',
                'icon' => 'palette',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Antivirus',
                'slug' => 'antivirus',
                'description' => 'Antivirus and security software licenses',
                'icon' => 'shield',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Microsoft Office',
                'slug' => 'microsoft-office',
                'description' => 'Microsoft Office suite licenses (Word, Excel, PowerPoint, etc.)',
                'icon' => 'file-text',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'JetBrains',
                'slug' => 'jetbrains',
                'description' => 'JetBrains IDE licenses (IntelliJ IDEA, PyCharm, PhpStorm, etc.)',
                'icon' => 'code',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'AutoCAD',
                'slug' => 'autocad',
                'description' => 'Autodesk AutoCAD and design software licenses',
                'icon' => 'pen-tool',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Database Software',
                'slug' => 'database-software',
                'description' => 'Database management systems (Oracle, SQL Server, etc.)',
                'icon' => 'database',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Development Tools',
                'slug' => 'development-tools',
                'description' => 'General development tools and IDEs',
                'icon' => 'wrench',
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'name' => 'Project Management',
                'slug' => 'project-management',
                'description' => 'Project management and collaboration tools (Jira, Trello, etc.)',
                'icon' => 'kanban',
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'name' => 'Communication Tools',
                'slug' => 'communication-tools',
                'description' => 'Communication and collaboration software (Zoom, Teams, Slack)',
                'icon' => 'message-square',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Cloud Services',
                'slug' => 'cloud-services',
                'description' => 'Cloud platform subscriptions (AWS, Azure, Google Cloud)',
                'icon' => 'cloud',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Other Software',
                'slug' => 'other-software',
                'description' => 'Other software licenses not covered by specific categories',
                'icon' => 'package',
                'is_active' => true,
                'sort_order' => 12,
            ],
        ];

        foreach ($licenseTypes as $licenseType) {
            LicenseType::firstOrCreate(
                ['slug' => $licenseType['slug']],
                $licenseType
            );
        }
    }
}
