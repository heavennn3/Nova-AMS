import { useState } from 'react';
import { usePage } from '@inertiajs/react'; // Added import
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SystemMonitor } from '@/components/system-monitor';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added import
import { Button } from '@/components/ui/button'; // Added import
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Added import
import { UserMenuContent } from '@/components/user-menu-content'; // Added import
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials'; // Added import
import { Moon, Sun, Search, Plus, ChevronDown, Users, Package, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props; // Extract auth data
    const getInitials = useInitials(); // Extract hook for initials fallback
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    // State to toggle the "Create New" dropdown
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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

                {/* Right Side: Search, Create Action, and System Overlay Utilities */}
                <div className="flex items-center gap-4 ml-auto">

                    <nav className="hidden lg:flex items-center gap-1">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>Assets</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Users</span>
                        </button>
                    </nav>

                  

                    {/* "Create New" Action Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCreateOpen(!isCreateOpen)}
                            onBlur={() => setTimeout(() => setIsCreateOpen(false), 200)}
                            className="flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Create New</span>
                            <ChevronDown className={cn("h-3.5 w-3.5 opacity-70 transition-transform duration-200", isCreateOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu List */}
                        {isCreateOpen && (
                            <div className="absolute right-0 mt-1.5 w-48 z-50 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 slide-in-from-top-1">
                                <button
                                    onClick={() => console.log('Create Asset Triggered')}
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                >
                                    <Package className="mr-2 h-4 w-4 opacity-70" />
                                    <span>Create Asset</span>
                                </button>
                                <button
                                    onClick={() => console.log('Create User Triggered')}
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                >
                                    <Users className="mr-2 h-4 w-4 opacity-70" />
                                    <span>Create User</span>
                                </button>
                                <button
                                    onClick={() => console.log('Create Spare Part Triggered')}
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                >
                                    <Settings2 className="mr-2 h-4 w-4 opacity-70" />
                                    <span>Create Spare Part</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* System Monitor & Core Utilities */}
                    <div className="flex items-center gap-3 border-l border-border/60 pl-4">
                        <SystemMonitor />

                        {/* Dark / Light mode toggle pill */}
                        <button
                            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className={cn(
                                'relative flex h-7 w-[52px] items-center rounded-full border px-0.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                isDark ? 'border-slate-600 bg-slate-800' : 'border-amber-200 bg-amber-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                                    isDark ? 'left-[28px] bg-slate-200' : 'left-[2px] bg-amber-400',
                                )}
                            >
                                {isDark ? (
                                    <Moon className="h-3 w-3 text-slate-700" />
                                ) : (
                                    <Sun className="h-3 w-3 text-white" />
                                )}
                            </span>
                            <Sun className={cn('ml-1 h-3 w-3 transition-opacity duration-300', isDark ? 'text-slate-400 opacity-30' : 'opacity-0')} />
                            <Moon className={cn('mr-1 ml-auto h-3 w-3 transition-opacity duration-300', isDark ? 'opacity-0' : 'text-amber-400 opacity-30')} />
                        </button>

                        <NotificationBell />

                        {/* Profile Menu Dropdown (Moved here next to notifications) */}
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
                    </div>

                </div>
            </div>
        </header>
    );
}