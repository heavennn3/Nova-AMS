import { Table } from '@tanstack/react-table';
import { X, Download, FileText, Upload } from 'lucide-react';
import * as React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const formatExportData = () => {
        const exportRows = table.getFilteredRowModel().rows;
        const visibleColumns = table
            .getVisibleLeafColumns()
            .filter(
                (col) =>
                    col.id !== 'actions' &&
                    col.id !== 'select' &&
                    col.id !== 'Changes',
            );

        return exportRows.map((row, index) => {
            const formattedRow: any = { Bil: index + 1 };

            visibleColumns.forEach((col) => {
                const columnDef = col.columnDef as any;
                // Fallback to capitalizing col.id if no headerText or string header is provided
                const defaultHeader =
                    col.id.charAt(0).toUpperCase() +
                    col.id.slice(1).replace(/_/g, ' ');
                const header =
                    columnDef.headerText ||
                    (typeof columnDef.header === 'string'
                        ? columnDef.header
                        : defaultHeader);

                let val = '';
                try {
                    val = row.getValue(col.id) as string;
                } catch (e) {
                    val = '';
                }

                if (val === null || val === undefined) val = '';
                else if (typeof val === 'object') val = JSON.stringify(val);
                else val = String(val);

                formattedRow[header] = val;
            });

            return formattedRow;
        });
    };

    const exportFileName = searchKey ? `${searchKey}_export` : 'data_export';

    const handleExportExcel = () => {
        const formattedData = formatExportData();
        if (formattedData.length === 0) {
            alert('No data to export');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Export');
        XLSX.writeFile(wb, `${exportFileName}.xlsx`);
    };

    const handleExportCSV = () => {
        const formattedData = formatExportData();
        if (formattedData.length === 0) {
            alert('No data to export');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${exportFileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const formattedData = formatExportData();
        if (formattedData.length === 0) {
            alert('No data to export');
            return;
        }

        const doc = new jsPDF('landscape');
        const headers = Object.keys(formattedData[0]);
        const rows = formattedData.map((obj) => Object.values(obj)) as any[];

        autoTable(doc, {
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
        });

        doc.save(`${exportFileName}.pdf`);
    };
    const handleExportMySQL = () => {
        // Trigger backend export of MySQL dump
        const link = document.createElement('a');
        link.href = '/assets/export-mysql';
        link.download = `${exportFileName}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: false, // We'll manually find the headers
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as string[][];

                // Find the header row (look for typical ID column like 'Aset ID' or 'Asset ID')
                let headerRowIndex = 0;
                for (let i = 0; i < Math.min(rows.length, 20); i++) {
                    const row = rows[i];
                    if (
                        row.some(
                            (cell) =>
                                typeof cell === 'string' &&
                                (cell.trim().toLowerCase() === 'aset id' ||
                                    cell.trim().toLowerCase() === 'asset id' ||
                                    cell.trim().toLowerCase() === 'asset_id'),
                        )
                    ) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex >= rows.length) {
                    alert('Could not detect valid headers in CSV.');
                    return;
                }

                const headers = rows[headerRowIndex].map((h) => h.trim());
                const dataRows = rows.slice(headerRowIndex + 1);

                const parsedData = dataRows.map((row) => {
                    const obj: any = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                if (onImportCsv) {
                    onImportCsv(parsedData);
                }

                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

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

            <div className="flex items-center space-x-2">
                {onImportCsv && (
                    <>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImportCSV}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden h-8 lg:flex"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Button>
                    </>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuItem onClick={handleExportCSV}>
                            <FileText className="mr-2 h-4 w-4" /> Export CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>
                            <FileText className="mr-2 h-4 w-4" /> Export Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                            <FileText className="mr-2 h-4 w-4" /> Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportMySQL}>
                            <FileText className="mr-2 h-4 w-4" /> Export MySQL
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
