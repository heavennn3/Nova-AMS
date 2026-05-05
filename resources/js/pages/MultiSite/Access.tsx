import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { ShieldCheck, UserCog, Edit, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Access({ sites, users }: { sites: any[], users: any[] }) {
    const columns = [
        { 
            accessorKey: "name", 
            header: "User Name",
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
            )
        },
        { 
            accessorKey: "role", 
            header: "System Role",
            cell: ({ row }: any) => {
                const role = row.original.role;
                let colorClass = "bg-slate-100 text-slate-800 border-slate-200";
                
                if (role === 'Admin') colorClass = "bg-rose-100 text-rose-800 border-rose-200";
                if (role === 'Site Manager') colorClass = "bg-amber-100 text-amber-800 border-amber-200";
                if (role === 'Technician') colorClass = "bg-blue-100 text-blue-800 border-blue-200";
                
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass} flex items-center w-fit`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                    </span>
                );
            }
        },
        { 
            accessorKey: "site", 
            header: "Site Access",
            cell: ({ row }: any) => (
                <div className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                    <span className={row.original.site_id ? "text-foreground" : "text-primary font-medium"}>
                        {row.original.site}
                    </span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${row.original.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                    </Link>
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Access Control" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
                        Access Control
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage user permissions and site-specific access rights.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/users/create">
                        <UserCog className="h-4 w-4 mr-2" />
                        Add New User
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
                <div className="flex items-center mb-6 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                    <span>
                        <strong>Security Policy:</strong> Admins have global access. Site Managers and Technicians are restricted to their assigned locations.
                    </span>
                </div>
                <DataTable 
                    columns={columns} 
                    data={users.filter(u => u.role !== 'admin')} 
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
