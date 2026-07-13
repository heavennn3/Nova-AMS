import type { Table } from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    totalRows: number;
    setPageIndex: (index: number) => void;
    setPageSize: (size: number) => void;
}

export function DataTablePagination<TData>({
    table,
    pageIndex,
    pageSize,
    pageCount,
    totalRows,
    setPageIndex,
    setPageSize,
}: DataTablePaginationProps<TData>) {
    const showingCount = Math.min((pageIndex + 1) * pageSize, totalRows);
    const hasMore = showingCount < totalRows;
    const isShowingAll = pageSize >= totalRows;

    return (
        <div className="flex flex-col gap-3 pt-1">
            {/* View More / View All row */}
            {totalRows > 10 && (
                <div className="flex items-center justify-center gap-3">
                    {!isShowingAll && hasMore && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-medium"
                            onClick={() => {
                                setPageSize(Math.min(pageSize + 10, totalRows));
                                setPageIndex(0);
                            }}
                        >
                            View More (+10)
                        </Button>
                    )}
                    <Button
                        variant={isShowingAll ? "default" : "outline"}
                        size="sm"
                        className={`h-8 text-xs font-medium ${isShowingAll ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => {
                            if (isShowingAll) {
                                setPageSize(10);
                            } else {
                                setPageSize(totalRows);
                            }

                            setPageIndex(0);
                        }}
                    >
                        {isShowingAll ? '✓ Showing All' : `View All (${totalRows})`}
                    </Button>
                </div>
            )}

            {/* Pagination controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <span>{table.getFilteredSelectedRowModel().rows.length} of {totalRows} row(s) selected.</span>
                    )}
                    {table.getFilteredSelectedRowModel().rows.length === 0 && (
                        <span>
                            Showing {Math.min(pageIndex * pageSize + 1, totalRows)}–{showingCount} of {totalRows}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {pageIndex + 1} of {Math.max(1, pageCount)}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPageIndex(0)}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                            disabled={pageIndex === 0}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                                setPageIndex(Math.min(pageCount - 1, pageIndex + 1))
                            }
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setPageIndex(pageCount - 1)}
                            disabled={pageIndex >= pageCount - 1}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
