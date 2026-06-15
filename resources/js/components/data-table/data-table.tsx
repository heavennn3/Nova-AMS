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

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onImportCsv?: (data: any[]) => void;
    hideToolbar?: boolean;
    onBatchDelete?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onImportCsv,
    hideToolbar,
    onBatchDelete,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState<string>('');
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(10);

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
        return [selectColumn, ...columns];
    }, [columns, selectColumn]);

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
            {selectedRows.length > 0 && (
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
                                            const val = row.original[col.accessorKey];
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
                        {onBatchDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to delete these ${selectedRows.length} items?`)) {
                                        onBatchDelete(selectedRows.map((r) => r.original));
                                        table.resetRowSelection();
                                    }
                                }}
                            >
                                Delete Selected
                            </Button>
                        )}
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
