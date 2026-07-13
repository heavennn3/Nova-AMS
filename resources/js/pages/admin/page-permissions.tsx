import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Shield,
    User,
    CheckCircle,
    XCircle,
    Copy,
    Users,
    Settings,
    Eye,
    EyeOff,
    Download,
    Upload,
    RefreshCw,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Permission {
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
}

interface PagePermission {
    id: number;
    name: string;
    route: string;
    description: string;
    module: string;
    permissions: Permission;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface PagePermissionsProps {
    pages: Array<{
        id: number;
        name: string;
        route: string;
        description: string;
        module: string;
    }>;
    users: UserInfo[];
    modules: string[];
}

export default function PagePermissions({ pages, users, modules }: PagePermissionsProps) {
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [userPermissions, setUserPermissions] = useState<PagePermission[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [showCopyDialog, setShowCopyDialog] = useState(false);
    const [copyFromUser, setCopyFromUser] = useState<number | null>(null);
    const [copyToUser, setCopyToUser] = useState<number | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPages = pages.filter(page => {
        const matchesModule = selectedModule === 'all' || page.module === selectedModule;

        return matchesModule;
    });

    const handleUserClick = async (user: UserInfo) => {
        setLoading(true);
        setSelectedUser(user);

        try {
            const response = await fetch(`/admin/page-permissions/user/${user.id}`);
            const data = await response.json();

            setUserPermissions(data.permissions);
            setExpandedSections(new Set(modules));
        } catch (error) {
            toast.error('Failed to load user permissions');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (pageId: number, permission: keyof Permission, value: boolean) => {
        setUserPermissions(prev =>
            prev.map(page =>
                page.id === pageId
                    ? {
                        ...page,
                        permissions: {
                            ...page.permissions,
                            [permission]: value,
                        },
                    }
                    : page
            )
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedUser) {
return;
}

        setLoading(true);

        try {
            await router.post(`/admin/page-permissions/user/${selectedUser.id}`, {
                permissions: userPermissions.map(page => ({
                    page_permission_id: page.id,
                    ...page.permissions,
                })),
            });

            toast.success('Permissions updated successfully');
            router.reload();
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPermissions = async () => {
        if (!copyFromUser || !copyToUser) {
            toast.error('Please select both users');

            return;
        }

        setLoading(true);

        try {
            await router.post('/admin/page-permissions/copy', {
                from_user_id: copyFromUser,
                to_user_id: copyToUser,
            });

            toast.success('Permissions copied successfully');
            setShowCopyDialog(false);
            router.reload();
        } catch (error) {
            toast.error('Failed to copy permissions');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);

            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }

            return newSet;
        });
    };

    const getPermissionColor = (hasPermission: boolean) => {
        return hasPermission ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100';
    };

    const getModulePages = (module: string) => {
        return userPermissions.filter(page => page.module === module);
    };

    const hasAnyChanges = () => {
        // Compare current state with initial state (simplified)
        return userPermissions.some(page =>
            Object.values(page.permissions).some(perm => perm === true)
        );
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Page Permissions Management" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Page Permissions Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage CRUD permissions for users on specific pages
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCopyDialog(true)}
                        className="flex items-center gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Copy Permissions
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <Card className="border border-border bg-card/40">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="flex h-10 w-48 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        >
                            <option value="all">All Modules</option>
                            {modules.map(module => (
                                <option key={module} value={module}>
                                    {module.replace('module.', '').replace('-', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Users List */}
                <Card className="border border-border bg-card/40">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/40 p-4">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">{filteredUsers.length}</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className="flex cursor-pointer items-center justify-between border-b border-border/60 p-4 transition-colors hover:bg-accent/40"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <span
                                                key={role}
                                                className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions Editor */}
                <Card className="border border-border bg-card/40 lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/40 p-4">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {selectedUser ? `Permissions: ${selectedUser.name}` : 'Select a User'}
                        </CardTitle>
                        {selectedUser && (
                            <Button
                                onClick={handleSavePermissions}
                                disabled={loading || !hasAnyChanges()}
                                size="sm"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : selectedUser ? (
                            <div className="max-h-[600px] overflow-y-auto p-4">
                                {modules.map(module => {
                                    const modulePages = getModulePages(module);

                                    if (modulePages.length === 0) {
return null;
}

                                    const isExpanded = expandedSections.has(module);
                                    const moduleDisplayName = module.replace('module.', '').replace('-', ' ').toUpperCase();

                                    return (
                                        <div key={module} className="mb-4">
                                            <div
                                                onClick={() => toggleSection(module)}
                                                className="mb-2 flex cursor-pointer items-center justify-between rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted/60"
                                            >
                                                <div className="text-sm font-semibold text-foreground">
                                                    {moduleDisplayName}
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>

                                            {isExpanded && (
                                                <div className="space-y-2 pl-4">
                                                    {modulePages.map(page => (
                                                        <div
                                                            key={page.id}
                                                            className="rounded-lg border border-border/60 bg-card/40 p-3"
                                                        >
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-sm font-medium text-foreground">
                                                                        {page.name}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {page.description}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs font-mono text-muted-foreground">
                                                                    {page.route}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-4 gap-2">
                                                                {(['create', 'read', 'update', 'delete'] as const).map(permission => (
                                                                    <div key={permission} className="flex flex-col items-center">
                                                                        <Label
                                                                            htmlFor={`${page.id}-${permission}`}
                                                                            className="mb-1 text-xs text-muted-foreground capitalize"
                                                                        >
                                                                            {permission}
                                                                        </Label>
                                                                        <button
                                                                            id={`${page.id}-${permission}`}
                                                                            onClick={() =>
                                                                                handlePermissionChange(
                                                                                    page.id,
                                                                                    `can_${permission}` as keyof Permission,
                                                                                    !page.permissions[`can_${permission}`]
                                                                                )
                                                                            }
                                                                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                                                                page.permissions[`can_${permission}`]
                                                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                                                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                                                            }`}
                                                                        >
                                                                            {page.permissions[`can_${permission}`] ? (
                                                                                <CheckCircle className="h-4 w-4" />
                                                                            ) : (
                                                                                <XCircle className="h-4 w-4" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <Shield className="mx-auto mb-2 h-12 w-12" />
                                    <p>Select a user to manage their page permissions</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Copy Permissions Dialog */}
            <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Copy Permissions</DialogTitle>
                        <DialogDescription>
                            Copy all page permissions from one user to another
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="from-user">From User</Label>
                            <select
                                id="from-user"
                                value={copyFromUser || ''}
                                onChange={(e) => setCopyFromUser(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                            >
                                <option value="">Select user...</option>
                                {users.map(user => (
                                    <option key={`from-${user.id}`} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="to-user">To User</Label>
                            <select
                                id="to-user"
                                value={copyToUser || ''}
                                onChange={(e) => setCopyToUser(Number(e.target.value))}
                                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                            >
                                <option value="">Select user...</option>
                                {users.map(user => (
                                    <option key={`to-${user.id}`} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCopyPermissions} disabled={loading}>
                            {loading ? 'Copying...' : 'Copy Permissions'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

PagePermissions.layout = {
    breadcrumbs: [
        {
            title: 'Page Permissions',
            href: '/admin/page-permissions',
        },
    ],
};