import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { ShieldCheck, UserCog } from 'lucide-react';

export default function Access({ sites, users }: { sites: any[], users: any[] }) {
    const columns = [
        { accessorKey: "name", header: "User Name" },
        { accessorKey: "email", header: "Email" },
        { 
            accessorKey: "role", 
            header: "System Role",
            cell: () => <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Administrator</span>
        },
        { 
            accessorKey: "access", 
            header: "Site Access",
            cell: () => <span className="text-muted-foreground text-sm">All Locations</span>
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Access Control" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
                    Access Control
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage user permissions and site-specific access rights.
                </p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-4">
                <div className="flex items-center mb-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                    <UserCog className="h-5 w-5 mr-2" />
                    Currently showing global access list.
                </div>
                <DataTable 
                    columns={columns} 
                    data={users} 
                    searchKey="name" 
                />
            </div>
        </div>
    );
}

Access.layout = {
    breadcrumbs: [
        {
            title: 'Access Control',
            href: '#',
        },
    ],
};
