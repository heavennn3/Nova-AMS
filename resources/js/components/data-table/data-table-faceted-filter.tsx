import * as React from 'react';
import { Check, PlusCircle, X } from 'lucide-react';
import { Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: Option[];
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Derive selected values from column filter state
    const filterValue = column?.getFilterValue();
    const selectedValues: Set<string> = React.useMemo(() => {
        if (Array.isArray(filterValue)) {
            return new Set<string>(filterValue as string[]);
        }
        return new Set<string>();
    }, [filterValue]);

    // Close on outside click
    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const toggleValue = (value: string) => {
        const next = new Set(selectedValues);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        const arr = Array.from(next);
        column?.setFilterValue(arr.length ? arr : undefined);
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        column?.setFilterValue(undefined);
    };

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div ref={containerRef} className="relative">
            <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed"
                onClick={() => setOpen((prev) => !prev)}
                type="button"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                {title}
                {selectedValues.size > 0 && (
                    <>
                        <Separator
                            orientation="vertical"
                            className="mx-2 h-4"
                        />
                        <div className="flex items-center gap-1">
                            {selectedValues.size > 2 ? (
                                <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {selectedValues.size} selected
                                </Badge>
                            ) : (
                                Array.from(selectedValues).map((val) => (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {val}
                                    </Badge>
                                ))
                            )}
                        </div>
                    </>
                )}
            </Button>

            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-56 rounded-md border bg-popover shadow-md">
                    {/* Search */}
                    <div className="flex items-center border-b px-3 py-2">
                        <svg
                            className="mr-2 h-4 w-4 shrink-0 opacity-50"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder={`Search ${title}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No results.
                            </p>
                        )}
                        {filteredOptions.map((option) => {
                            const isSelected = selectedValues.has(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={cn(
                                        'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                                        isSelected && 'bg-accent/50',
                                    )}
                                    onClick={() => toggleValue(option.value)}
                                >
                                    <div
                                        className={cn(
                                            'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                                            isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'opacity-50',
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </div>
                                    {option.icon && (
                                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="flex-1 text-left">
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear */}
                    {selectedValues.size > 0 && (
                        <>
                            <div className="border-t" />
                            <div className="p-1">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    onClick={clearAll}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear filters
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
