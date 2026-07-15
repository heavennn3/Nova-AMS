import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Map,
    Package,
    Wrench,
    MapPin,
    Shield,
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
} from '@/routes';

import type { NavItem } from '@/types';

type NavSection = {
    title: string;
    items: (NavItem & { roles?: string[] })[];
};

const ADMIN_ONLY = ['Admin'];
const ADMIN_MANAGER = ['Admin', 'Manager'];

const navSections: NavSection[] = [
    {
        title: 'MAIN',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, module: 'Dashboard' },
        ],
    },
    {
        title: 'INVENTORY',


        items: [


            { title: 'ICT Asset List', href: assetInventory(), icon: Package, module: 'ICT Asset List' },
            { title: 'Asset Loan', href: '/asset-loans', icon: Package, module: 'Asset Loan' },

            { title: 'Spare Part ', href: '/spare-parts/dashboard', icon: Wrench, module: 'Spare Part' },




        ],
    },



    {
        title: 'SOFTWARE LICENSES',

        items: [

            { title: 'Key & Licenses', href: '/licenses', icon: Key, module: 'Key & Licenses' },



        ],
    },

    {
        title: 'SITES MANAGEMENT',

        items: [
            { title: 'Site Dashboard', href: '/multi-site/dashboards', icon: MapPin, module: 'Site Dashboard' },

            { title: 'Asset Transfer', href: '/multi-site/transfers', icon: MapPin, module: 'Asset Transfer' },

        ],
    },


    {
        title: 'OPERATIONS',

        items: [
            {
                title: ' Requests',
                href: '/requests/admin',
                icon: ClipboardList,
                module: 'Requests',
            },

            {
                title: ' Asset Track',
                href: '/asset-track',
                icon: Map,
                module: 'Asset Track',
            },


        ],
    },



    {
        title: 'OTHERS',
        items: [
            {
                title: 'Audit Log',
                href: '/security/logs',
                icon: ScrollText,
                module: 'Audit Log',
            },
            {
                title: 'Deleted Items',
                href: '/security/recycle-bin',
                icon: Trash2,
                module: 'Deleted Items',
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
                module: 'Users',
            },
            {
                title: 'Access Control',
                href: '/security/roles',
                icon: Shield,
                module: 'Access Control',
            },
            {
                title: 'Settings',
                href: '/settings',
                icon: Settings,
                module: 'Setting',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<any>().props;

    const modulePermissions: string[] = auth.user?.modulePermissions ?? [];
    const isAdmin = auth.user?.roles?.includes('Admin') ?? false;

    const canAccess = (module?: string) => {
        if (isAdmin || !module) {
            return true;
        }

        return modulePermissions.includes(module);
    };

    const filteredNavSections = navSections
        .map((section) => {
            return {
                ...section,
                items: section.items.filter((item) => {
                    const roles = (item as any).roles as string[] | undefined;
                    const canAccessRole = !roles || roles.some((role) => auth.user?.roles?.includes(role));

                    return canAccessRole && canAccess((item as any).module);
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
