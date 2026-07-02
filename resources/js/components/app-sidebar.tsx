import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Map,
    Package,
    Database,
    Wrench,
    MapPin,
    Activity,
    Shield,
    FileText,

    Headset,
    Trash2,
    Settings,
    History,
    MessageSquare,
    ClipboardList,
    ArrowRightLeft,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
    dashboard,
    assetInventory,
    masterData,
    operationsMaintenance,
    userManagement,

} from '@/routes';

import type { NavItem } from '@/types';

type NavSection = {
    title: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        title: 'NOVA AMS',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        title: 'ASSET MANAGEMENT',
        items: [

            {
                title: 'Inventory',
                href: '#',
                icon: Package,
                module: 'Asset Inventory',
                items: [
                    {
                        title: 'Assets',
                        href: assetInventory(),
                    },
                    {
                        title: 'Loan',
                        href: '#',
                    },
                ],
            },
            {
                title: 'Asset Withdrawal',
                href: '/live-tracking',
                icon: Activity,
                module: 'Asset Inventory',
            },


            {
                title: 'Multi-Site Management',
                href: '#',
                icon: MapPin,
                module: 'Multi-Site Management',
                items: [
                    {
                        title: 'Site Dashboards',
                        href: '/multi-site/dashboards',
                    },
                    {
                        title: 'Transfer Workflows',
                        href: '/multi-site/transfers',
                    },
                ],
            },
            {
                title: 'Software Licenses',
                href: '/licenses',
                icon: FileText,
                module: 'Asset Inventory',
                items: [
                    { title: 'License Inventory', href: '/licenses' },
                    { title: 'Usage Report', href: '/licenses/usage-report' },
                    { title: 'Renewals', href: '/licenses/renewals' },
                ],
            },
        ],
    },
    {
        title: 'OPERATIONS',

        items: [
            {
                title: ' Requests',
                href: '/requests/admin',
                icon: ClipboardList,
                module: 'Asset Inventory',
            },

            {
                title: 'Maintenance Operations',
                href: operationsMaintenance(),
                icon: Wrench,
                module: 'Operations & Maintenance',
            },
            {
                title: 'Comprehensive Maintenance',
                href: '#',
                icon: Wrench,
                module: 'Operations & Maintenance',
                items: [
                    {
                        title: 'Preventive Scheduling',
                        href: '/maintenance/scheduling',
                    },
                    { title: 'Work Orders', href: '/maintenance/work-orders' },
                    {
                        title: 'Maintenance History',
                        href: '/maintenance/history',
                    },

                    {
                        title: 'Technician Assignment',
                        href: '/maintenance/technicians',
                    },
                ],
            },

        ],
    },

    {
        title: 'ADMINISTRATION',
        items: [
            {
                title: 'Users',
                href: '#',
                icon: Shield,
                module: 'System Settings',
                items: [
                    { title: 'Manage Users', href: userManagement() },
                    { title: 'Access Control', href: '/security/roles' },
                ],
            },
            {
                title: 'Technician Center',
                href: '#',
                icon: Wrench,
                module: 'Operations & Maintenance',
                items: [
                    { title: 'Manage Technicians', href: '/technicians' },
                    { title: 'Assign Work Orders', href: '/maintenance/work-orders' },
                    { title: 'Performance Reports', href: '/maintenance/history' },
                ],
            },
            {
                title: 'Document Management',
                href: '#',
                icon: FileText,
                module: 'Document Management',
                items: [
                    { title: 'Asset Documentation', href: '/documents/assets' },
                    {
                        title: 'Maintenance Records',
                        href: '/documents/maintenance',
                    },
                    {
                        title: 'Contract Documents',
                        href: '/documents/contracts',
                    },
                    { title: 'Version Control', href: '/documents/versions' },
                    { title: 'Expiration Alerts', href: '/documents/alerts' },
                ],
            },


        ],
    },

    {
        title: 'OTHERS',
        items: [
            {
                title: 'Master Data',
                href: masterData(),
                icon: Database,
                module: 'Master Data',
            },
            { title: 'Spare Parts', href: '/spare-parts/dashboard', icon: Wrench },

            {
                title: 'Requests',
                href: '/requests',
                icon: ClipboardList,
                module: 'Asset Inventory',
            },
            {
                title: 'Check Out / Check In',
                href: '/checkout',
                icon: ArrowRightLeft,
                module: 'Asset Inventory',
            },
            {
                title: 'Transactions',
                href: '/transactions',
                icon: History,
                module: 'Asset Inventory',
            },
            {
                title: 'Chat',
                href: '/support/tickets',
                icon: MessageSquare,
                module: 'Asset Inventory',
            },
            {
                title: 'Activity Logs',
                href: '/security/logs',
                icon: History,
                module: 'System Settings',
            },
            {
                title: 'Deleted Items',
                href: '#',
                icon: Trash2,
                module: 'System Settings',
                items: [
                    {
                        title: 'Vendors',
                        href: '/security/recycle-bin?type=vendors',
                    },
                    {
                        title: 'Spareparts',
                        href: '/security/recycle-bin?type=spareparts',
                    },
                    {
                        title: 'Users',
                        href: '/security/recycle-bin?type=users',
                    },
                    {
                        title: 'Assets',
                        href: '/security/recycle-bin?type=assets',
                    },
                ],
            },
            {
                title: 'Settings',
                href: '#',
                icon: Settings,
                module: 'System Settings',
                items: [
                    { title: 'Custom Fields', href: '/settings/custom-fields' },
                    { title: 'Status Labels', href: '/settings/status-labels' },
                    { title: 'Asset Models', href: '/settings/asset-models' },
                    { title: 'Categories', href: '/settings/categories' },
                    { title: 'Manufacturers', href: '/settings/manufacturers' },
                    { title: 'Suppliers/Vendors', href: '/settings/suppliers' },
                    { title: 'Departments', href: '/settings/departments' },
                    { title: 'Locations', href: '/settings/locations' },
                ],
            },

        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<any>().props;

    const modulePermissions: string[] = auth.user?.modulePermissions ?? [];
    const isAdmin = auth.user?.roles?.includes('Admin') ?? false;
    const isManager = auth.user?.roles?.includes('Manager') || auth.user?.roles?.includes('Site Manager') || false;
    const isEmployee = auth.user?.roles?.includes('Employee') || auth.user?.roles?.includes('Technician') || auth.user?.roles?.includes('Viewer') || false;

    const canAccess = (module?: string) => {
        if (!module) return true; // No restriction (e.g. Dashboard)
        return modulePermissions.includes(module);
    };

    const filteredNavSections = navSections
        .map((section) => {
            return {
                ...section,
                items: section.items.filter((item) => {
                    const isTechnician = auth.user?.roles?.includes('Technician');

                    if (isTechnician && !isAdmin && !isManager) {
                        // Technicians should see their own dashboard and relevant items
                        const allowedForTechnician = [
                            'Dashboard',
                            'Asset Inventory',
                            'Asset Withdrawal',
                            'Maintenance Operations',
                            'Comprehensive Maintenance',
                            'Preventive Scheduling',
                            'Work Orders',
                            'Maintenance History',
                            'Technician Assignment',
                            'Master Data',
                            'Spare Parts',
                            'Requests',
                            'Check Out / Check In',
                            'Transactions',
                            'Chat',
                            'Activity Logs',
                        ];
                        return allowedForTechnician.includes(item.title);
                    }

                    if (isEmployee && !isAdmin && !isManager && !isTechnician) {
                        // Regular employees (non-technicians)
                        const allowedForNormalUser = [
                            'Dashboard',
                            'Asset Inventory',
                            'Maintenance Operations',
                            'Requests',
                            'Check Out / Check In',
                            'Transactions',
                            'Chat',
                        ];
                        return allowedForNormalUser.includes(item.title);
                    }

                    if (isAdmin || isManager) {
                        // Admin/Manager: hide user "Requests", "Check Out / Check In", and "Transactions" pages
                        const hiddenForAdminOrManager = ['Requests', 'Check Out / Check In', 'Transactions'];
                        if (hiddenForAdminOrManager.includes(item.title)) return false;

                        // Standard module access check
                        return canAccess((item as any).module);
                    }

                    // Fallback for any other users
                    const allowedForNormalUser = [
                        'Dashboard',
                        'Asset Inventory',
                        'Maintenance Operations',
                        'Requests',
                        'Check Out / Check In',
                        'Transactions',
                        'Chat',
                    ];
                    return allowedForNormalUser.includes(item.title);
                }),
            };
        })
        .filter((section): section is NavSection => section !== null && section.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {filteredNavSections.map((section) => (
                    <div key={section.title}>
                        <div className="px-4 py-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            {section.title}
                        </div>
                        <NavMain items={section.items} />
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
