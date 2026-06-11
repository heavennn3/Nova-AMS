import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTableActions } from './data-table-actions';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchKey?: string;
    data: TData[];
    columns: any[];
    onImportCsv?: (data: any[]) => void;
}

export function DataTableToolbar<TData>({
    table,
    searchKey,
    data,
    columns,
    onImportCsv,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const exportFileName = searchKey ? `${searchKey}_export` : 'data_export';
    const exportData = table.getFilteredRowModel().rows.map((row) => row.original);

    const [searchColumn, setSearchColumn] = React.useState<string>(
        searchKey || 'all',
    );

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
                <Select
                    value={searchColumn}
                    onValueChange={(val) => {
                        setSearchColumn(val);
                        table.setGlobalFilter('');
                        table.resetColumnFilters();
                    }}
                >
                    <SelectTrigger className="hidden h-8 w-[130px] md:flex">
                        <SelectValue placeholder="Search in..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Columns</SelectItem>
                        {columns
                            .filter(
                                (c) =>
                                    (c.accessorKey || c.id) &&
                                    (typeof c.header === 'string' ||
                                        c.headerText),
                            )
                            .map((c) => {
                                const key = c.accessorKey || c.id;
                                return (
                                    <SelectItem key={key} value={key}>
                                        {c.headerText || c.header}
                                    </SelectItem>
                                );
                            })}
                    </SelectContent>
                </Select>

                <Input
                    placeholder={
                        searchColumn === 'all'
                            ? 'Search all data...'
                            : `Search in ${searchColumn}...`
                    }
                    value={
                        searchColumn === 'all'
                            ? ((table.getState().globalFilter as string) ?? '')
                            : ((table
                                  .getColumn(searchColumn)
                                  ?.getFilterValue() as string) ?? '')
                    }
                    onChange={(event) => {
                        if (searchColumn === 'all') {
                            table.setGlobalFilter(event.target.value);
                        } else {
                            table
                                .getColumn(searchColumn)
                                ?.setFilterValue(event.target.value);
                        }
                    }}
                    className="h-8 w-[150px] lg:w-[300px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            table.setGlobalFilter('');
                        }}
                        className="h-8 px-2 text-muted-foreground lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <DataTableActions
                data={exportData}
                columns={columns}
                exportFileName={exportFileName}
                onImportCsv={onImportCsv}
            />
        </div>
    );
}
