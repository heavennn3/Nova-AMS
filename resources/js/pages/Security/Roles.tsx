import { Head, router, usePage } from '@inertiajs/react';
import {
    Shield,
    Check,
    X,
    Settings,
    Eye,
    Wrench,
    Star,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Role {
    id: number;
    name: string;
    description: string;
    /** Keyed by module name → true/false, sourced directly from DB */
    moduleAccess: Record<string, boolean>;
}

interface Props {
    roles: Role[];
    modules: string[];
}

// ── Visual config ────────────────────────────────────────────────────────────

const ROLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
    Admin: Star,
    'Site Manager': Settings,
    Technician: Wrench,
    Viewer: Eye,
};

const ROLE_COLORS: Record<
    string,
    { bg: string; border: string; text: string; badge: string; bar: string }
> = {
    Admin: {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        bar: 'bg-purple-500',
    },
    'Site Manager': {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        bar: 'bg-blue-500',
    },
    Technician: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        bar: 'bg-amber-500',
    },
    Viewer: {
        bg: 'bg-slate-50 dark:bg-slate-950/30',
        border: 'border-slate-200 dark:border-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        bar: 'bg-slate-500',
    },
};

const DEFAULT_COLOR = {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700',
    bar: 'bg-gray-400',
};

// ── Build initial matrix from server-provided role data ──────────────────────

function buildMatrix(
    roles: Role[],
    modules: string[],
): Record<string, Record<string, boolean>> {
    const matrix: Record<string, Record<string, boolean>> = {};

    for (const role of roles) {
        matrix[role.name] = {};

        for (const mod of modules) {
            matrix[role.name][mod] = role.moduleAccess[mod] ?? false;
        }
    }

    return matrix;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Roles({ roles, modules }: Props) {
    const { props } = usePage<any>();

    // Matrix state — seeded directly from server data (real DB state)
    const [accessMatrix, setAccessMatrix] = useState<
        Record<string, Record<string, boolean>>
    >(() => buildMatrix(roles, modules));

    // Track the "last saved" snapshot so Discard can revert cleanly
    const [savedMatrix, setSavedMatrix] = useState<
        Record<string, Record<string, boolean>>
    >(() => buildMatrix(roles, modules));

    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    const toggleAccess = useCallback((roleName: string, module: string) => {
        setAccessMatrix((prev) => ({
            ...prev,
            [roleName]: {
                ...prev[roleName],
                [module]: !prev[roleName]?.[module],
            },
        }));
        setDirty(true);
        setSavedFlash(false);
    }, []);

    const handleSave = () => {
        setSaving(true);
        router.post(
            '/security/roles/matrix',
            { matrix: accessMatrix },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavedMatrix({ ...accessMatrix });
                    setDirty(false);
                    setSaving(false);
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 3000);
                },
                onError: () => {
                    setSaving(false);
                },
            },
        );
    };

    const handleDiscard = () => {
        setAccessMatrix({ ...savedMatrix });
        setDirty(false);
        setSavedFlash(false);
    };

    const getAccessCount = (roleName: string) =>
        Object.values(accessMatrix[roleName] ?? {}).filter(Boolean).length;

    const getModuleAccessCount = (module: string) =>
        roles.filter((r) => accessMatrix[r.name]?.[module]).length;

    return (
        <div className="w-full space-y-6 p-6">
            <Head title="Role Access & Permissions" />

            {/* ── Header ── */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="mb-1 flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Role Access &amp; Permissions
                        </h1>
                    </div>
                    <p className="ml-[52px] text-sm text-muted-foreground">
                        Configure module access rights for each role. Changes
                        are saved to the database.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {savedFlash && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            Saved!
                        </span>
                    )}
                    {dirty && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDiscard}
                            disabled={saving}
                        >
                            Discard
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!dirty || saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : dirty ? (
                            'Save Changes'
                        ) : (
                            'All Saved'
                        )}
                    </Button>
                </div>
            </div>

            {/* ── Role Summary Cards ── */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {roles
                    .filter((role) => role.name !== 'Admin')
                    .map((role) => {
                        const RoleIcon = ROLE_ICONS[role.name] ?? Shield;
                        const colors = ROLE_COLORS[role.name] ?? DEFAULT_COLOR;
                        const accessCount = getAccessCount(role.name);
                        const pct = Math.round(
                            (accessCount / modules.length) * 100,
                        );

                        return (
                            <Card
                                key={role.id}
                                className={`border ${colors.border} ${colors.bg} shadow-sm transition-all hover:shadow-md`}
                            >
                                <CardHeader className="px-4 pt-4 pb-2">
                                    <div className="mb-1 flex items-center justify-between">
                                        <RoleIcon
                                            className={`h-5 w-5 ${colors.text}`}
                                        />
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.badge}`}
                                        >
                                            {accessCount}/{modules.length}{' '}
                                            modules
                                        </span>
                                    </div>
                                    <CardTitle
                                        className={`text-base ${colors.text}`}
                                    >
                                        {role.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs leading-relaxed">
                                        {role.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-500 ${colors.bar}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>

            {/* ── Permissions Matrix ── */}
            <Card className="overflow-hidden border-border shadow-sm">
                <CardHeader className="border-b bg-muted/30 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">
                                Permissions Matrix
                            </CardTitle>
                            <CardDescription className="mt-0.5 text-sm">
                                Click a cell to toggle access. Hit{' '}
                                <strong>Save Changes</strong> to persist to the
                                database.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                    <Check className="h-3 w-3" />
                                </span>
                                Access granted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400">
                                    <X className="h-3 w-3" />
                                </span>
                                No access
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/10 hover:bg-muted/10">
                                    <TableHead className="w-[220px] border-r pl-6 text-sm font-semibold text-foreground">
                                        System Module
                                    </TableHead>
                                    <TableHead className="w-16 border-r py-2 text-center text-[11px] font-normal text-muted-foreground">
                                        Roles w/ Access
                                    </TableHead>
                                    {roles
                                        .filter((role) => role.name !== 'Admin')
                                        .map((role) => {
                                            const RoleIcon =
                                                ROLE_ICONS[role.name] ?? Shield;
                                            const colors =
                                                ROLE_COLORS[role.name] ??
                                                DEFAULT_COLOR;

                                            return (
                                                <TableHead
                                                    key={role.id}
                                                    className="min-w-[140px] border-r text-center last:border-r-0"
                                                >
                                                    <div
                                                        className={`mx-2 my-1 rounded-lg px-3 py-2 ${colors.bg} ${colors.border} border`}
                                                    >
                                                        <RoleIcon
                                                            className={`h-4 w-4 ${colors.text} mx-auto mb-0.5`}
                                                        />
                                                        <div
                                                            className={`text-xs font-semibold ${colors.text}`}
                                                        >
                                                            {role.name}
                                                        </div>
                                                    </div>
                                                </TableHead>
                                            );
                                        })}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {modules.map((module) => {
                                    const accessCount =
                                        getModuleAccessCount(module);

                                    return (
                                        <TableRow
                                            key={module}
                                            className="transition-colors hover:bg-muted/20"
                                        >
                                            <TableCell className="border-r bg-muted/5 py-3 pl-6 text-sm font-medium">
                                                {module}
                                            </TableCell>
                                            <TableCell className="border-r text-center">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                    {accessCount}
                                                </span>
                                            </TableCell>
                                            {roles
                                                .filter(
                                                    (role) =>
                                                        role.name !== 'Admin',
                                                )
                                                .map((role) => {
                                                    const hasAccess =
                                                        accessMatrix[
                                                            role.name
                                                        ]?.[module] ?? false;
                                                    // Highlight cells that differ from saved state
                                                    const changed =
                                                        hasAccess !==
                                                        (savedMatrix[
                                                            role.name
                                                        ]?.[module] ?? false);

                                                    return (
                                                        <TableCell
                                                            key={`${module}-${role.id}`}
                                                            className={`border-r py-3 text-center transition-colors last:border-r-0 ${changed ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                                        >
                                                            <button
                                                                title={`${hasAccess ? 'Revoke' : 'Grant'} ${role.name} access to ${module}`}
                                                                onClick={() =>
                                                                    toggleAccess(
                                                                        role.name,
                                                                        module,
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${changed ? 'ring-2 ring-amber-400 ring-offset-1' : ''} ${
                                                                    hasAccess
                                                                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 focus:ring-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                        : 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:bg-red-900/30 dark:text-red-400'
                                                                } `}
                                                            >
                                                                {hasAccess ? (
                                                                    <Check className="h-4 w-4" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            {changed && (
                                                                <div className="mt-0.5 text-[9px] leading-none font-semibold text-amber-500">
                                                                    unsaved
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* ── Sticky bottom save bar ── */}
            {dirty && (
                <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background px-5 py-3 shadow-2xl">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                    <span className="text-sm font-medium">Unsaved changes</span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDiscard}
                        disabled={saving}
                    >
                        Discard
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}

Roles.layout = {
    breadcrumbs: [
        { title: 'System & Administration', href: '#' },
        { title: 'Role Access & Permissions', href: '/security/roles' },
    ],
};
