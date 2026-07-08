import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Map,
    Package,
    Database,
    Wrench,
    MapPin,
    Shield,
    FileText,
    Users,
    Trash2,
    Settings,
    ClipboardList,
    Key,
    ScrollText,
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
} from '@/routes';

import type { NavItem } from '@/types';

type NavSection = {
    title: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        title: 'MAIN',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        title: 'MANAGEMENT SYSTEM',
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
                        href: '/asset-loans',
                    },
                ],
            },

            { title: 'Spare Parts', href: '/spare-parts/dashboard', icon: Wrench },

            {
                title: 'Site Management',
                href: '#',
                icon: MapPin,
                module: 'Multi-Site Management',
                items: [
                    {
                        title: 'Dashboards',
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
                icon: Key,
                module: 'Asset Inventory',
                items: [
                    { title: 'License Inventory', href: '/licenses' },
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
                title: ' Asset Track',
                href: '/asset-track',
                icon: Map,
                module: 'Asset Inventory',
            },

            {
                title: 'Document',
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
            {
                title: 'Audit Log',
                href: '/security/logs',
                icon: ScrollText,
                module: 'System Settings',
            },
            {
                title: 'Deleted Items',
                href: '/security/recycle-bin',
                icon: Trash2,
                module: 'System Settings',
            },
        ],
    },
    {
        title: 'ADMINISTRATION',
        items: [
            {
                title: 'Users',
                href: '/users',
                icon: Users,
                module: 'System Settings',
            },
            {
                title: 'Access Control',
                href: '/security/roles',
                icon: Shield,
                module: 'System Settings',
            },
            {
                title: 'Settings',
                href: '/settings',
                icon: Settings,
                module: 'System Settings',
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
                    // Standard module access check
                    return canAccess((item as any).module);
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
