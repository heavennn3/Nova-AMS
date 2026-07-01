import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { RefreshCcw } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onImportCsv?: (data: any[]) => void;
    hideToolbar?: boolean;
    onBatchDelete?: (selectedRows: TData[]) => void;
    onBatchRestore?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onImportCsv,
    hideToolbar,
    onBatchDelete,
    onBatchRestore,
}: DataTableProps<TData, TValue>) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>('');
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);

    const getResourceTypeFromUrl = () => {
        if (typeof window === 'undefined') return undefined;
        const path = window.location.pathname;
        if (path.includes('/settings/categories')) return 'categories';
        if (path.includes('/settings/departments')) return 'departments';
        if (path.includes('/settings/custom-fields')) return 'custom-fields';
        if (path.includes('/settings/status-labels')) return 'status-labels';
        if (path.includes('/settings/asset-models')) return 'asset-models';
        if (path.includes('/settings/locations')) return 'locations';
        if (path.includes('/settings/suppliers')) return 'suppliers';
        if (path.includes('/settings/manufacturers')) return 'manufacturers';
        if (path.includes('/users')) return 'users';
        if (path.includes('/assets') || path.includes('/asset-inventory') || path.includes('/live-tracking') || path.includes('/lifecycle')) return 'assets';
        if (path.includes('/work-orders')) return 'work-orders';
        if (path.includes('/spare-parts') || path.includes('/maintenance/parts')) return 'spare-parts';
        if (path.includes('/licenses')) return 'licenses';
        return undefined;
    };

    const resourceType = getResourceTypeFromUrl();

    const selectColumn = React.useMemo<ColumnDef<TData, TValue>>(() => ({
        id: 'select',
        header: ({ table }) => (
            <div className="px-1">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="px-1">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    }), []);

    const tableColumns = React.useMemo(() => {
        return isAdmin ? [selectColumn, ...columns] : columns;
    }, [columns, selectColumn, isAdmin]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
        },
    });

    // Manually paginate the fully sorted & filtered rows
    const allRows = table.getRowModel().rows;
    const totalRows = allRows.length;
    const pageCount = Math.ceil(totalRows / pageSize);
    const paginatedRows = allRows.slice(
        pageIndex * pageSize,
        (pageIndex + 1) * pageSize,
    );

    // Reset page index if the total rows change (e.g. search query filters rows out)
    React.useEffect(() => {
        setPageIndex(0);
    }, [totalRows]);

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const handleBulkDelete = () => {
        if (!resourceType) return;
        const ids = selectedRows.map((r: any) => r.original.id);
        const confirmMsg = `Are you sure you want to delete these ${selectedRows.length} items?`;
        if (confirm(confirmMsg)) {
            toast.promise(
                fetch('/api/quick/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ type: resourceType, ids })
                }).then(async (res) => {
                    if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.message || 'Failed to delete records.');
                    }
                    return res.json();
                }),
                {
                    loading: `Deleting ${selectedRows.length} items...`,
                    success: (res) => {
                        table.resetRowSelection();
                        router.reload();
                        return res.message || 'Items deleted successfully!';
                    },
                    error: (err) => err.message || 'Deletion failed.'
                }
            );
        }
    };

    const handleBulkStatusUpdate = (statusVal: string) => {
        if (!resourceType) return;
        const ids = selectedRows.map((r: any) => r.original.id);
        toast.promise(
            fetch('/api/quick/bulk-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ type: resourceType, ids, status: statusVal })
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to update status.');
                }
                return res.json();
            }),
            {
                loading: `Updating status for ${selectedRows.length} items...`,
                success: (res) => {
                    table.resetRowSelection();
                    router.reload();
                    return res.message || 'Status updated successfully!';
                },
                error: (err) => err.message || 'Update failed.'
            }
        );
    };

    return (
        <div className="space-y-4">
            {!hideToolbar && (
                <DataTableToolbar
                    table={table}
                    searchKey={searchKey}
                    data={data}
                    columns={columns}
                    onImportCsv={onImportCsv}
                />
            )}
            {isAdmin && selectedRows.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-xs">
                    <div className="flex items-center space-x-2 text-sm font-semibold">
                        <span>{selectedRows.length} items selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const headers = columns
                                    .map((col: any) => col.headerText || col.accessorKey)
                                    .filter(Boolean);
                                const rows = selectedRows.map((row) =>
                                    columns
                                        .map((col: any) => {
                                            if (!col.accessorKey) return null;
                                            const val = (row.original as any)[col.accessorKey];
                                            return typeof val === 'object' ? JSON.stringify(val) : val;
                                        })
                                        .filter((v) => v !== null)
                                );
                                const csvContent =
                                    'data:text/csv;charset=utf-8,' +
                                    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement('a');
                                link.setAttribute('href', encodedUri);
                                link.setAttribute('download', 'selected_items.csv');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            Export Selected
                        </Button>
                        {['assets', 'work-orders', 'users'].includes(resourceType || '') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Modify Status
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    {resourceType === 'assets' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('available')}>Available</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('in_use')}>In Use</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('maintenance')}>Maintenance</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('faulty')}>Faulty</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('retired')}>Retired</DropdownMenuItem>
                                        </>
                                    )}
                                    {resourceType === 'work-orders' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('open')}>Open</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('in_progress')}>In Progress</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>Completed</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('closed')}>Closed</DropdownMenuItem>
                                        </>
                                    )}
                                    {resourceType === 'users' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('active')}>Activate</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('deactivated')}>Deactivate</DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {onBatchRestore ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to restore these ${selectedRows.length} items?`)) {
                                        onBatchRestore(selectedRows.map((r) => r.original));
                                        table.resetRowSelection();
                                    }
                                }}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Restore Selected
                            </Button>
                        ) : null}
                        {onBatchDelete ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete these ${selectedRows.length} items? This action cannot be undone.`)) {
                                        onBatchDelete(selectedRows.map((r) => r.original));
                                        table.resetRowSelection();
                                    }
                                }}
                            >
                                Delete Selected
                            </Button>
                        ) : resourceType ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                Delete Selected
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.resetRowSelection()}
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {paginatedRows.length ? (
                            paginatedRows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={tableColumns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination
                table={table}
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageCount={pageCount}
                totalRows={totalRows}
                setPageIndex={setPageIndex}
                setPageSize={setPageSize}
            />
        </div>
    );
}
