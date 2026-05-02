import { Link } from '@inertiajs/react';
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
    Sparkles,
    CircleDollarSign,
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
                items: [
                    { title: 'Interactive Map View', href: geographicView() },
                    { title: 'Site Floor Plans', href: '/mapping/floor-plans' },
                    { title: 'GPS Tracking', href: '/mapping/gps' },
                    { title: 'Route Optimization', href: '/mapping/routes' },
                ],
            },
        ],
    },
    {
        title: 'ASSET MANAGEMENT',
        items: [
            { title: 'Asset Inventory', href: assetInventory(), icon: Package },
            { title: 'Master Data', href: masterData(), icon: Database },
            {
                title: 'Multi-Site Management',
                href: '#',
                icon: MapPin,
                items: [
                    { title: 'Location Tracking', href: '/multi-site/tracking' },
                    { title: 'Site Dashboards', href: '/multi-site/dashboards' },
                    { title: 'Transfer Workflows', href: '/multi-site/transfers' },
                    { title: 'Access Control', href: '/multi-site/access' },
                ],
            },
            {
                title: 'Asset Lifecycle',
                href: '#',
                icon: Activity,
                items: [
                    { title: 'Asset Status Tracking', href: '/lifecycle/status' },
                    { title: 'Depreciation Calculation', href: '/lifecycle/depreciation' },
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
            { title: 'Maintenance Operations', href: operationsMaintenance(), icon: Wrench },
            {
                title: 'Comprehensive Maintenance',
                href: '#',
                icon: Wrench,
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
        title: 'SYSTEM & ADMINISTRATION',
        items: [
            {
                title: 'User Management & Security',
                href: '#',
                icon: Shield,
                items: [
                    { title: 'Manage Users & Roles', href: userManagement() },
                    { title: 'Audit Logging', href: '/security/logs' },
                    { title: '2FA Settings', href: '/settings/profile' },
                ],
            },
            {
                title: 'Document Management',
                href: '#',
                icon: FileText,
                items: [
                    { title: 'Asset Documentation', href: '/documents/assets' },
                    { title: 'Maintenance Records', href: '/documents/maintenance' },
                    { title: 'Contract Documents', href: '/documents/contracts' },
                    { title: 'Version Control', href: '/documents/versions' },
                    { title: 'Expiration Alerts', href: '/documents/alerts' },
                ],
            },
            {
                title: 'Advanced Features',
                href: '#',
                icon: Sparkles,
                items: [
                    { title: 'Barcode/QR Generation', href: '/advanced/barcodes' },
                    { title: 'Mobile App Settings', href: '/advanced/mobile' },
                    { title: 'Offline Mode Config', href: '/advanced/offline' },
                    { title: 'Notifications (Email/SMS)', href: '/advanced/notifications' },
                    { title: 'API Integration', href: '/advanced/api' },
                    { title: 'Data Import/Export', href: '/advanced/data' },
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