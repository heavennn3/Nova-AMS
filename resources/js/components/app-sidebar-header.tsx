import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SystemMonitor } from '@/components/system-monitor';
import { NotificationBell } from '@/components/notification-bell';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 w-full">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                
                <div className="ml-auto flex items-center gap-4">
                    <SystemMonitor />
                    
                    <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                        {/* Dark / Light mode toggle pill */}
                        <button
                            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className={cn(
                                'relative flex h-7 w-[52px] items-center rounded-full border px-0.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                isDark
                                    ? 'border-slate-600 bg-slate-800'
                                    : 'border-amber-200 bg-amber-50',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                                    isDark
                                        ? 'left-[28px] bg-slate-200'
                                        : 'left-[2px] bg-amber-400',
                                )}
                            >
                                {isDark
                                    ? <Moon className="h-3 w-3 text-slate-700" />
                                    : <Sun className="h-3 w-3 text-white" />
                                }
                            </span>
                            <Sun className={cn('ml-1 h-3 w-3 transition-opacity duration-300', isDark ? 'opacity-30 text-slate-400' : 'opacity-0')} />
                            <Moon className={cn('ml-auto mr-1 h-3 w-3 transition-opacity duration-300', isDark ? 'opacity-0' : 'opacity-30 text-amber-400')} />
                        </button>

                        <NotificationBell />
                    </div>
                </div>
            </div>
        </header>
    );
}
