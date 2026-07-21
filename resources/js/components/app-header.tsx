import { Link, router, usePage } from '@inertiajs/react';
import { LayoutGrid, Menu, Moon, Search, Sun } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';
import { useState, type FormEvent } from 'react';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    /*  {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },*/
];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

const globalSearchItems = [
    { title: 'Dashboard', href: '/dashboard', keywords: 'home summary overview' },
    { title: 'ICT Asset List', href: '/asset-inventory', keywords: 'assets inventory ict asset list' },
    { title: 'Asset Loan', href: '/asset-loans', keywords: 'loan borrow return' },
    { title: 'Spare Part', href: '/spare-parts/dashboard', keywords: 'spare parts wrench' },
    { title: 'Licenses', href: '/licenses', keywords: 'software license key' },
    { title: 'Site Dashboard', href: '/multi-site/dashboards', keywords: 'site multisite dashboard' },
    { title: 'Asset Transfer', href: '/multi-site/transfers', keywords: 'transfer site move asset' },
    { title: 'Requests', href: '/requests/admin', keywords: 'request approval admin' },
    { title: 'Asset Track', href: '/asset-track', keywords: 'tracking live loan return' },
    { title: 'Audit Log', href: '/security/logs', keywords: 'audit logs security' },
    { title: 'Deleted Items', href: '/security/recycle-bin', keywords: 'deleted recycle bin trash' },
    { title: 'Users', href: '/users', keywords: 'user account people' },
    { title: 'Access Control', href: '/security/roles', keywords: 'roles permission access' },
    { title: 'Settings', href: '/settings', keywords: 'configuration admin settings' },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const [globalSearch, setGlobalSearch] = useState('');

    const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const query = globalSearch.trim().toLowerCase();
        if (!query) return;

        const match = globalSearchItems.find((item) =>
            `${item.title} ${item.keywords}`.toLowerCase().includes(query),
        );

        if (match) {
            router.visit(match.href);
            setGlobalSearch('');
        }
    };

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <img
                                        src="/images/novatis-logo.png"
                                        alt="Novatis Resources"
                                        className="h-7 w-auto object-contain"
                                    />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <form onSubmit={handleGlobalSearch} className="relative hidden sm:block">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={globalSearch}
                                onChange={(event) => setGlobalSearch(event.target.value)}
                                placeholder="Search"
                                className="h-9 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </form>

                        {/* Dark / Light mode toggle pill */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() =>
                                        updateAppearance(
                                            isDark ? 'light' : 'dark',
                                        )
                                    }
                                    aria-label={
                                        isDark
                                            ? 'Switch to light mode'
                                            : 'Switch to dark mode'
                                    }
                                    className={cn(
                                        'relative flex h-7 w-[52px] items-center rounded-full border px-0.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                        isDark
                                            ? 'border-slate-600 bg-slate-800'
                                            : 'border-amber-200 bg-amber-50',
                                    )}
                                >
                                    {/* sliding knob */}
                                    <span
                                        className={cn(
                                            'absolute flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                                            isDark
                                                ? 'left-[28px] bg-slate-200'
                                                : 'left-[2px] bg-amber-400',
                                        )}
                                    >
                                        {isDark ? (
                                            <Moon className="h-3 w-3 text-slate-700" />
                                        ) : (
                                            <Sun className="h-3 w-3 text-white" />
                                        )}
                                    </span>
                                    {/* background icons */}
                                    <Sun
                                        className={cn(
                                            'ml-1 h-3 w-3 transition-opacity duration-300',
                                            isDark
                                                ? 'text-slate-400 opacity-30'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <Moon
                                        className={cn(
                                            'mr-1 ml-auto h-3 w-3 transition-opacity duration-300',
                                            isDark
                                                ? 'opacity-0'
                                                : 'text-amber-400 opacity-30',
                                        )}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>
                                    {isDark
                                        ? 'Switch to light mode'
                                        : 'Switch to dark mode'}
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        <NotificationBell />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
