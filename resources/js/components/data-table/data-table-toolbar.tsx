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

    const handleExportExcel = () => {
        // Simple export of all data passed into the table
        const ws = XLSX.utils.json_to_sheet(data as any);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'export.xlsx');
    };

    const handleExportCSV = () => {
        const ws = XLSX.utils.json_to_sheet(data as any);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        // Extract headers from columns (ignoring select/actions columns if possible)
        const headers = columns
            .filter((c) => c.accessorKey && c.header && typeof c.header === 'string')
            .map((c) => c.header as string);

        const keys = columns
            .filter((c) => c.accessorKey)
            .map((c) => c.accessorKey);

        const rows = data.map((row: any) => keys.map((key) => row[key] || ''));

        autoTable(doc, {
            head: [headers],
            body: rows,
        });

        doc.save('export.pdf');
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (onImportCsv) {
                    onImportCsv(results.data);
                }
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {searchKey && (
                    <Input
                        placeholder={`Search ${searchKey}...`}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3 text-muted-foreground"
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
                            className="h-8 hidden lg:flex"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                        </Button>
                    </>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 ml-auto hidden lg:flex">
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
