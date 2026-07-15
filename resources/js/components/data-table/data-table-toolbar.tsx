import type { Table } from '@tanstack/react-table';
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
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchKey?: string;
    data: TData[];
    columns: any[];
    onImportCsv?: (data: any[]) => void;
    assetStatuses?: { id: number; name: string; color: string }[];
}

export function DataTableToolbar<TData>({
    table,
    searchKey,
    data,
    columns,
    onImportCsv,
    assetStatuses,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const exportFileName = searchKey ? `${searchKey}_export` : 'data_export';
    const exportData = table.getFilteredRowModel().rows.map((row) => row.original);

    const [searchColumn, setSearchColumn] = React.useState<string>(
        searchKey || 'all',
    );


}
