import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react';

export default function UsersIndex({ users }: { users: any[] }) {
    const columns = [
        {
            accessorKey: "name",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Email Address" />
            ),
        },
        {
            accessorKey: "role",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }: any) => {
                const role = row.original.role;
                const colors: Record<string, string> = {
                    'Admin': 'bg-purple-100 text-purple-800',
                    'Site Manager': 'bg-blue-100 text-blue-800',
                    'Technician': 'bg-green-100 text-green-800',
                    'Viewer': 'bg-gray-100 text-gray-800',
                };
                
                const colorClass = colors[role] || 'bg-secondary text-secondary-foreground';

                return (
                    <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                            {role}
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: "sites",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned Sites" />
            ),
            cell: ({ row }: any) => {
                const sites = row.original.sites || [];
                if (sites.length === 0) return <span className="text-muted-foreground italic text-xs">All Sites</span>;
                
                return (
                    <div className="flex flex-wrap gap-1">
                        {sites.map((site: string) => (
                            <span key={site} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium border border-slate-200">
                                {site}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const user = row.original;
                const isAdmin = user.role === 'Admin';

                if (isAdmin) {
                    return <span className="text-muted-foreground text-xs italic">System Admin</span>;
                }

                return (
                    <div className="flex items-center space-x-2">
                        <Link href={`/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                                <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                        </Link>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                    router.delete(`/users/${user.id}`);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="User Management" />
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage roles, site assignments, and user access across the system.
                    </p>
                </div>
                <Link href="/users/create">
                    <Button>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Add New User
                    </Button>
                </Link>
            </div>
            
            <DataTable 
                columns={columns} 
                data={users || []} 
                searchKey="name"
            />
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '#',
        },
    ],
};
