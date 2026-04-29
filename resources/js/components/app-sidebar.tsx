import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    Map,
    Users,
    BarChart,
    Settings,
    FileText,
    Package,
    Building,
    Wrench,
    Calendar,
    Database,
    UserCheck,
    ListChecks,
    MapPin,
    ClipboardCheck,
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
    assetRegister,
    assetLocation,
    assetAvailability,
    assetAssignment,
    workOrders,
    preventiveMaintenance,
    spareParts,
    vendors,
    documents,
    masterData,
    userManagement,
    reports,
    systemSettings,
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
            { title: 'Asset Register', href: assetRegister(), icon: Package },
            { title: 'Asset Location / Geographic View', href: assetLocation(), icon: MapPin },
            { title: 'Asset Availability', href: assetAvailability(), icon: ClipboardCheck },
        ],
    },
    {
        title: 'OPERATIONS',
        items: [
            { title: 'Asset Assigned', href: assetAssignment(), icon: UserCheck },
            { title: 'Work Orders / Faults', href: workOrders(), icon: Wrench },
            { title: 'Preventive Maintenance', href: preventiveMaintenance(), icon: Calendar },
            { title: 'Spare Parts', href: spareParts(), icon: Package },
        ],
    },
    {
        title: 'RESOURCES',
        items: [
            { title: 'Vendors', href: vendors(), icon: Building },
            { title: 'Documents', href: documents(), icon: FileText },
            { title: 'Master Data', href: masterData(), icon: Database },
        ],
    },
    {
        title: 'ADMINISTRATION',
        items: [
            { title: 'User Management', href: userManagement(), icon: Users },
            { title: 'Reports', href: reports(), icon: BarChart },
            { title: 'System Settings', href: systemSettings(), icon: Settings },
        ],
    },
];

const footerNavItems: NavItem[] = [
  /*  {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },*/
];

export function AppSidebar() {
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
                {navSections.map(section => (
                    <div key={section.title}>
                        <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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