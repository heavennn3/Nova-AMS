import { router, usePage } from '@inertiajs/react';
import type {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable
} from '@tanstack/react-table';
import { RefreshCcw, Package, AlertTriangle, CheckCircle, Download, FileText, Circle, XCircle } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

const getAssetStatusStyle = (status: string) => {
    const normalized = status?.toLowerCase();
    const styles: Record<string, { className: string; icon: React.ElementType }> = {
        available: { className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300', icon: CheckCircle },
        stored: { className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300', icon: Package },
        moved: { className: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300', icon: RefreshCcw },
        used: { className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300', icon: Circle },
        repair: { className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300', icon: AlertTriangle },
        faulty: { className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300', icon: XCircle },
    };

    return styles[normalized] || { className: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300', icon: Circle };
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onImportCsv?: (data: any[]) => void;
    hideToolbar?: boolean;
    onBatchDelete?: (selectedRows: TData[]) => void;
    onBatchRestore?: (selectedRows: TData[]) => void;
    assetStatuses?: { id: number; name: string; color: string }[];
    enableRowSelection?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onImportCsv,
    hideToolbar,
    onBatchDelete,
    onBatchRestore,
    assetStatuses,
    enableRowSelection = true,
}: DataTableProps<TData, TValue>) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;
    const isManager = auth?.user?.roles?.includes('Manager') || auth?.user?.roles?.includes('Site Manager') || false;
    const isTechnician = auth?.user?.roles?.includes('Technician') ?? false;
    const canUpdateStatus = isAdmin || isManager || isTechnician;

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
        if (typeof window === 'undefined') {
return undefined;
}

        const path = window.location.pathname;

        if (path.includes('/settings/categories')) {
return 'categories';
}

        if (path.includes('/settings/departments')) {
return 'departments';
}

        if (path.includes('/settings/custom-fields')) {
return 'custom-fields';
}

        if (path.includes('/settings/status-labels')) {
return 'status-labels';
}

        if (path.includes('/settings/asset-models')) {
return 'asset-models';
}

        if (path.includes('/settings/locations')) {
return 'locations';
}

        if (path.includes('/settings/suppliers')) {
return 'suppliers';
}

        if (path.includes('/settings/manufacturers')) {
return 'manufacturers';
}

        if (path.includes('/settings')) {
return 'settings';
}

        if (path.includes('/users')) {
return 'users';
}

        if (path.includes('/assets') || path.includes('/asset-inventory') || path.includes('/asset-track')) {
return 'assets';
}

        if (path.includes('/work-orders')) {
return 'work-orders';
}

        if (path.includes('/spare-parts') || path.includes('/maintenance/parts')) {
return 'spare-parts';
}

        if (path.includes('/licenses')) {
return 'licenses';
}

        // Generic fallback: use last meaningful path segment
        const segments = path.split('/').filter(s => s && !s.startsWith('master-data'));

        return segments.length > 0 ? segments[segments.length - 1] : undefined;
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
        return enableRowSelection ? [selectColumn, ...columns] : columns;
    }, [columns, enableRowSelection, selectColumn]);

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
        const ids = selectedRows.map((r: any) => r.original.id);

        if (ids.length === 0) {
            toast.error('No records selected.');

            return;
        }

        const confirmMsg = `Are you sure you want to delete these ${selectedRows.length} items?`;

        if (!confirm(confirmMsg)) {
return;
}

        const type = resourceType || window.location.pathname.split('/').filter(Boolean).pop() || 'unknown';

        toast.promise(
            fetch('/quick/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ type, ids })
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
    };

    const handleBulkStatusUpdate = (statusVal: string | number) => {
        if (!resourceType) {
return;
}

        const ids = selectedRows.map((r: any) => r.original.id);

        if (ids.length === 0) {
 toast.error('No records selected.');

 return; 
}

        if (resourceType === 'spare-parts') {
            router.post('/spare-parts/bulk-update-status', { ids, status: statusVal }, {
                preserveScroll: true,
                onSuccess: () => {
 table.resetRowSelection(); router.reload(); 
},
            });
        } else if (resourceType === 'licenses') {
            router.post('/licenses/bulk-update-status', { ids, status: statusVal }, {
                preserveScroll: true,
                onSuccess: () => {
 table.resetRowSelection(); router.reload(); 
},
            });
        } else {
            router.post('/assets/bulk-update-status', { ids, status_id: statusVal }, {
                preserveScroll: true,
                onSuccess: () => {
 table.resetRowSelection(); 
},
            });
        }
    };

    const exportSelectedCsv = () => {
        const headers = columns
            .map((col: any) => col.headerText || col.accessorKey)
            .filter(Boolean);
        const rows = selectedRows.map((row) =>
            columns
                .map((col: any) => {
                    if (!col.accessorKey) {
                        return null;
                    }

                    const val = (row.original as any)[col.accessorKey];

                    return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                })
                .filter((v) => v !== null) as string[]
        );
        const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const csvContent = [headers, ...rows]
            .map((row) => row.map(escapeCsv).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'selected_items.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportSelectedPdf = () => {
        const headers = columns
            .map((col: any) => col.headerText || col.accessorKey)
            .filter(Boolean);
        const rows = selectedRows.map((row) =>
            columns
                .map((col: any) => {
                    if (!col.accessorKey) {
                        return null;
                    }

                    const val = (row.original as any)[col.accessorKey];

                    return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                })
                .filter((v) => v !== null) as string[]
        );
        const escapeHtml = (value: string) => value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] || char));
        const win = window.open('', '_blank');

        if (!win) {
            toast.error('Popup blocked. Allow popups to export PDF.');
            return;
        }

        win.document.write(`
            <html>
                <head>
                    <title>Selected Items Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
                        h1 { margin: 0 0 4px; font-size: 22px; }
                        .meta { color: #6b7280; margin-bottom: 18px; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th { background: #f3f4f6; text-align: left; }
                        th, td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Selected Items</h1>
                    <div class="meta">Total: ${selectedRows.length} · Exported: ${new Date().toLocaleString()}</div>
                    <table>
                        <thead><tr>${headers.map((header) => `<th>${escapeHtml(String(header))}</th>`).join('')}</tr></thead>
                        <tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody>
                    </table>
                    <script>window.onload = () => { window.print(); };</script>
                </body>
            </html>
        `);
        win.document.close();
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
                    assetStatuses={assetStatuses}
                />
            )}
            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-4 shadow-sm">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-primary">
                        <span>{selectedRows.length} items selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" /> Export Selected
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={exportSelectedPdf}>
                                    <FileText className="mr-2 h-4 w-4" /> PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportSelectedCsv}>
                                    <Download className="mr-2 h-4 w-4" /> CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {canUpdateStatus && ['assets', 'work-orders', 'users', 'spare-parts', 'licenses'].includes(resourceType || '') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Modify Status
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    {resourceType === 'assets' && (
                                        <>{(assetStatuses || []).map(s => {
                                            const style = getAssetStatusStyle(s.name);
                                            const StatusIcon = style.icon;

                                            return (
                                                <DropdownMenuItem key={s.id} onClick={() => handleBulkStatusUpdate(s.id)} className="p-1">
                                                    <span className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${style.className}`}>
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {s.name}
                                                    </span>
                                                </DropdownMenuItem>
                                            );
                                        })}</>
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
                                    {resourceType === 'spare-parts' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('available')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                Available
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('in_used')}>
                                                <Package className="mr-2 h-4 w-4 text-blue-600" />
                                                In Use
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('faulty')}>
                                                <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                                Faulty
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {resourceType === 'licenses' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('available')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                Available
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('full')}>
                                                <Package className="mr-2 h-4 w-4 text-blue-600" />
                                                Full
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('expired')}>
                                                <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                                Expired
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {isAdmin && onBatchRestore ? (
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
                        {isAdmin && (onBatchDelete ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    const rows = selectedRows.map((r: any) => r.original);
                                    const msg = `Are you sure you want to delete these ${selectedRows.length} items?`;

                                    if (confirm(msg)) {
                                        onBatchDelete(rows);
                                        table.resetRowSelection();
                                    }
                                }}
                            >
                                Delete Selected
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDelete}
                            >
                                Delete Selected
                            </Button>
                        ))}
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
            <div className="rounded-lg border border-border/50 bg-card shadow-sm">
                <Table className="table-auto text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
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
                                    className="hover:bg-primary/5"
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
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Package className="h-8 w-8 opacity-20" />
                                        <p>No results found</p>
                                    </div>
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
