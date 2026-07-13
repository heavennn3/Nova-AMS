import { router } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Upload } from 'lucide-react';
import Papa from 'papaparse';
import * as React from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableActionsProps {
    data: any[];
    columns: any[];
    exportFileName?: string;
    onImportCsv?: (data: any[]) => void;
}

function formatExportData(data: any[], columns: any[]) {
    const visibleColumns = columns.filter(
        (col) =>
            (col.accessorKey || col.id) &&
            col.id !== 'actions' &&
            col.id !== 'select' &&
            col.id !== 'Changes',
    );

    return data.map((row, index) => {
        const formattedRow: any = { Bil: index + 1 };

        visibleColumns.forEach((col) => {
            const key = col.accessorKey || col.id;
            const defaultHeader =
                String(key).charAt(0).toUpperCase() +
                String(key).slice(1).replace(/_/g, ' ');
            const header =
                col.headerText ||
                (typeof col.header === 'string' ? col.header : defaultHeader);

            let val = row[key];

            if (val === null || val === undefined) {
val = '';
} else if (typeof val === 'object') {
val = JSON.stringify(val);
} else {
val = String(val);
}

            formattedRow[header] = val;
        });

        return formattedRow;
    });
}

export function DataTableActions({
    data,
    columns,
    exportFileName = 'data_export',
    onImportCsv,
}: DataTableActionsProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

        if (path.includes('/users')) {
return 'users';
}

        return undefined;
    };

    const resourceType = getResourceTypeFromUrl();

    const handleExportExcel = () => {
        const formattedData = formatExportData(data, columns);

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
        const formattedData = formatExportData(data, columns);

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
        const formattedData = formatExportData(data, columns);

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
        const link = document.createElement('a');
        link.href = '/assets/export-mysql';
        link.download = `${exportFileName}.sql`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as string[][];

                let headerRowIndex = 0;

                for (let i = 0; i < Math.min(rows.length, 20); i++) {
                    const row = rows[i];

                    if (
                        row.some(
                            (cell) =>
                                typeof cell === 'string' &&
                                (cell.trim().toLowerCase() === 'aset id' ||
                                    cell.trim().toLowerCase() === 'asset id' ||
                                    cell.trim().toLowerCase() === 'asset_id' ||
                                    cell.trim().toLowerCase() === 'name' ||
                                    cell.trim().toLowerCase() === 'nama'),
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
                } else if (resourceType) {
                    toast.promise(
                        fetch('/api/quick/bulk-import', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                type: resourceType,
                                rows: parsedData
                            })
                        }).then(async (res) => {
                            if (!res.ok) {
                                const err = await res.json();

                                throw new Error(err.message || 'Failed to import records.');
                            }

                            return res.json();
                        }),
                        {
                            loading: `Importing ${parsedData.length} records into ${resourceType}...`,
                            success: (res) => {
                                router.reload();

                                return res.message || 'Import successful!';
                            },
                            error: (err) => err.message || 'Import failed.'
                        }
                    );
                } else {
                    alert('Import functionality not configured for this table.');
                }

                if (fileInputRef.current) {
fileInputRef.current.value = '';
}
            },
        });
    };

    return (
        <div className="flex items-center gap-2">
            {(onImportCsv || resourceType) && (
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
                        className="h-8"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                    </Button>
                </>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
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
    );
}
