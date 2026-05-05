import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Map,
    Package,
    Database,
    Wrench,
    MapPin,
    Activity,
    ChartBar,
    Shield,
    FileText,
    Briefcase,
    CircleDollarSign,
    Headset,
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
    geographicView,
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
        title: 'OVERVIEW',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            {
                title: 'Geographic & Mapping',
                href: '#',
                icon: Map,
                module: 'Asset Inventory',
                items: [
                    { title: 'Interactive Map View', href: geographicView() },
                    { title: 'Site Floor Plans', href: '/mapping/floor-plans' },

                ],
            },
        ],
    },
    {
        title: 'ASSET MANAGEMENT',
        items: [
            { title: 'Asset Inventory', href: assetInventory(), icon: Package, module: 'Asset Inventory' },
            { title: 'Asset Withdrawal', href: '/live-tracking', icon: Activity, module: 'Asset Inventory' },
            { title: 'Master Data', href: masterData(), icon: Database, module: 'Master Data' },
            {
                title: 'Multi-Site Management',
                href: '#',
                icon: MapPin,
                module: 'Multi-Site Management',
                items: [
                    { title: 'Site Dashboards', href: '/multi-site/dashboards' },
                    { title: 'Transfer Workflows', href: '/multi-site/transfers' },
                    { title: 'Access Control', href: '/multi-site/access' },
                ],
            },
            {
                title: 'Asset Lifecycle',
                href: '#',
                icon: Activity,
                module: 'Operations & Maintenance',
                items: [
                    { title: 'Asset Status Tracking', href: '/lifecycle/status' },
                    { title: 'Warranty Management', href: '/lifecycle/warranty' },
                    { title: 'Health Scoring', href: '/lifecycle/health' },
                    { title: 'Audit Trail', href: '/lifecycle/audit' },
                ],
            },
        ],
    },
    {
        title: 'OPERATIONS & MAINTENANCE',
        items: [
            { title: 'Maintenance Operations', href: operationsMaintenance(), icon: Wrench, module: 'Operations & Maintenance' },
            {
                title: 'Comprehensive Maintenance',
                href: '#',
                icon: Wrench,
                module: 'Operations & Maintenance',
                items: [
                    { title: 'Preventive Scheduling', href: '/maintenance/scheduling' },
                    { title: 'Work Orders', href: '/maintenance/work-orders' },
                    { title: 'Maintenance History', href: '/maintenance/history' },
                    { title: 'Spare Parts', href: '/maintenance/parts' },
                    { title: 'Technician Assignment', href: '/maintenance/technicians' },
                ],
            },
            {
                title: 'Vendor & Contract',
                href: '#',
                icon: Briefcase,
                module: 'Operations & Maintenance',
                items: [
                    { title: 'Performance Tracking', href: '/vendors/performance' },
                    { title: 'Expiration Alerts', href: '/vendors/alerts' },
                    { title: 'SLAs', href: '/vendors/slas' },
                    { title: 'Purchase Orders', href: '/vendors/po' },
                    { title: 'Vendor Portal', href: '/vendors/portal' },
                ],
            },
        ],
    },
    {
        title: 'REPORTING & FINANCE',
        items: [
            {
                title: 'Analytics & Reporting',
                href: '#',
                icon: ChartBar,
                module: 'Analytics & Reporting',
                items: [
                    { title: 'Asset Utilization', href: '/analytics/utilization' },
                    { title: 'Cost Analysis', href: '/analytics/costs' },
                    { title: 'Availability Metrics', href: '/analytics/availability' },
                    { title: 'Compliance Reports', href: '/analytics/compliance' },
                    { title: 'Predictive Analytics', href: '/analytics/predictive' },
                    { title: 'Geographic Heat Maps', href: '/analytics/heatmaps' },
                ],
            },
            {
                title: 'Financial Management',
                href: '#',
                icon: CircleDollarSign,
                module: 'Financial Management',
                items: [
                    { title: 'Asset Valuation', href: '/finance/valuation' },
                    { title: 'Budget Tracking', href: '/finance/budgets' },
                    { title: 'Cost Center Allocation', href: '/finance/costs' },
                    { title: 'Purchase Requisitions', href: '/finance/requisitions' },
                    { title: 'Asset Insurance', href: '/finance/insurance' },
                ],
            },
        ],
    },
    {
        title: 'SUPPORT & HELPDESK',
        items: [
            {
                title: 'Helpdesk & Support',
                href: '#',
                icon: Headset,
                items: [
                    { title: 'Chat with Helpdesk', href: '/support/tickets' },
                ],
            },
        ],
    },
    {
        title: 'SYSTEM & ADMINISTRATION',
        items: [
            {
                title: 'User Management & Security',
                href: '#',
                icon: Shield,
                module: 'System Settings',
                items: [
                    { title: 'Manage Users & Roles', href: userManagement() },
                    { title: 'Role Access Matrix', href: '/security/roles' },
                    { title: 'Audit Logging', href: '/security/logs' },
                    { title: '2FA Settings', href: '/settings/profile' },
                ],
            },
            {
                title: 'Document Management',
                href: '#',
                icon: FileText,
                module: 'Document Management',
                items: [
                    { title: 'Asset Documentation', href: '/documents/assets' },
                    { title: 'Maintenance Records', href: '/documents/maintenance' },
                    { title: 'Contract Documents', href: '/documents/contracts' },
                    { title: 'Version Control', href: '/documents/versions' },
                    { title: 'Expiration Alerts', href: '/documents/alerts' },
                ],
            },
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
    const { auth } = usePage<any>().props;

    // modulePermissions is a flat array of module names the user can access,
    // e.g. ['Asset Inventory', 'Analytics & Reporting']
    const modulePermissions: string[] = auth.user?.modulePermissions ?? [];

    const canAccess = (module?: string) => {
        if (!module) return true; // No restriction (e.g. Dashboard)
        return modulePermissions.includes(module);
    };

    // Filter each section's items by module access, drop empty sections
    const filteredNavSections = navSections
        .map(section => ({
            ...section,
            items: section.items.filter(item => canAccess((item as any).module)),
        }))
        .filter(section => section.items.length > 0);

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
                {filteredNavSections.map(section => (
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