import { usePage } from '@inertiajs/react';
import { Link, router } from '@inertiajs/react';
import { Moon, Sun, Search, Plus, ChevronDown, Users, Package, Settings2, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';



import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
// Included 'Settings' in the lucide-react imports
import { cn } from '@/lib/utils';
import { settings } from '@/routes';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    // Fix SSR hydration mismatch: defer theme-dependent rendering until after mount
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(resolvedAppearance === 'dark');
    }, [resolvedAppearance]);

    // State to toggle the "Create New" dropdown
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const isAdmin = (auth as any)?.user?.roles?.includes('Admin') ?? false;

    return (
        <header className="flex h-16 shrink-0 items-center border-b border-sidebar-border/50 bg-background px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center justify-between gap-4">

                {/* Left Side: Brand, Trigger, and Navigation */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="-ml-1" />

                    <div className="hidden md:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                {/* Right Side: Search, Create Action, and Utilities */}
                <div className="flex items-center gap-4 ml-auto">

                    {/* Top-level Left Nav Items */}
                    <nav className="hidden lg:flex items-center gap-1">

                        <Link href="/asset-inventory" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>Assets</span>
                        </Link>
                        {isAdmin && (
                            <Link href="/users" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>Users</span>
                            </Link>
                        )}
                        {/* Moved Settings button here to align with Assets and Users nav tabs */}

                    </nav>

                    {/* Compact Search Box */}
                    <div className="relative w-40 sm:w-48 md:w-60">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {/* "Create New" Action Dropdown — Admin only */}
                    {isAdmin && (
                        <div className="relative">
                            <button
                                onClick={() => setIsCreateOpen(!isCreateOpen)}
                                onBlur={() => setTimeout(() => setIsCreateOpen(false), 200)}
                                className="flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Create</span>
                                <ChevronDown className={cn("h-3.5 w-3.5 opacity-70 transition-transform duration-200", isCreateOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown Menu List */}
                            {isCreateOpen && (
                                <div className="absolute right-0 mt-1.5 w-48 z-50 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 slide-in-from-top-1">
                                    <button
                                        onClick={() => router.visit('/asset-inventory')}
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                    >
                                        <Package className="mr-2 h-4 w-4 opacity-70" />
                                        <span>Create Asset</span>
                                    </button>
                                    <button
                                        onClick={() => router.visit('/users/create')}
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                    >
                                        <Users className="mr-2 h-4 w-4 opacity-70" />
                                        <span>Create User</span>
                                    </button>
                                    <button
                                        onClick={() => router.visit('/spare-parts/dashboard')}
                                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                    >
                                        <Settings2 className="mr-2 h-4 w-4 opacity-70" />
                                        <span>Create Spare Part</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Core Utilities */}
                    <div className="flex items-center gap-3 border-l border-border/60 pl-4">

                        {/* Dark / Light mode toggle pill */}
                        <button
                            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className={cn(
                                'relative flex h-7 w-[52px] items-center rounded-full border px-0.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                // Use neutral colors until mounted to prevent flash
                                !mounted
                                    ? 'border-border bg-muted'
                                    : isDark
                                        ? 'border-slate-600 bg-slate-800'
                                        : 'border-amber-200 bg-amber-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                                    !mounted
                                        ? 'left-[2px] bg-muted-foreground/20'
                                        : isDark
                                            ? 'left-[28px] bg-slate-200'
                                            : 'left-[2px] bg-amber-400',
                                )}
                            >
                                {mounted && (isDark ? (
                                    <Moon className="h-3 w-3 text-slate-700" />
                                ) : (
                                    <Sun className="h-3 w-3 text-white" />
                                ))}
                            </span>
                            {mounted && (
                                <>
                                    <Sun className={cn('ml-1 h-3 w-3 transition-opacity duration-300', isDark ? 'text-slate-400 opacity-30' : 'opacity-0')} />
                                    <Moon className={cn('mr-1 ml-auto h-3 w-3 transition-opacity duration-300', isDark ? 'opacity-0' : 'text-amber-400 opacity-30')} />
                                </>
                            )}
                        </button>

                        <NotificationBell />

                        {/* Profile Menu Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-neutral-200 text-xs font-medium text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mt-1.5" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Link href={settings()}>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </header>
    );
}