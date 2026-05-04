import { Head, router, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
    Admin:          Star,
    'Site Manager': Settings,
    Technician:     Wrench,
    Viewer:         Eye,
};

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; bar: string }> = {
    Admin:          { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', bar: 'bg-purple-500' },
    'Site Manager': { bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-200 dark:border-blue-800',     text: 'text-blue-700 dark:text-blue-300',     badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',     bar: 'bg-blue-500' },
    Technician:     { bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-amber-200 dark:border-amber-800',   text: 'text-amber-700 dark:text-amber-300',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',   bar: 'bg-amber-500' },
    Viewer:         { bg: 'bg-slate-50 dark:bg-slate-950/30',   border: 'border-slate-200 dark:border-slate-800',   text: 'text-slate-600 dark:text-slate-400',   badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',   bar: 'bg-slate-500' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400' };

// ── Build initial matrix from server-provided role data ──────────────────────

function buildMatrix(roles: Role[], modules: string[]): Record<string, Record<string, boolean>> {
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
    const [accessMatrix, setAccessMatrix] = useState<Record<string, Record<string, boolean>>>(
        () => buildMatrix(roles, modules),
    );

    // Track the "last saved" snapshot so Discard can revert cleanly
    const [savedMatrix, setSavedMatrix] = useState<Record<string, Record<string, boolean>>>(
        () => buildMatrix(roles, modules),
    );

    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    const toggleAccess = useCallback((roleName: string, module: string) => {
        setAccessMatrix(prev => ({
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
        roles.filter(r => accessMatrix[r.name]?.[module]).length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Role Access & Permissions" />

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Role Access &amp; Permissions
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-[52px]">
                        Configure module access rights for each role. Changes are saved to the database.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {savedFlash && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved!
                        </span>
                    )}
                    {dirty && (
                        <Button size="sm" variant="outline" onClick={handleDiscard} disabled={saving}>
                            Discard
                        </Button>
                    )}
                    <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Saving…
                            </>
                        ) : dirty ? 'Save Changes' : 'All Saved'}
                    </Button>
                </div>
            </div>

            {/* ── Role Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map(role => {
                    const RoleIcon = ROLE_ICONS[role.name] ?? Shield;
                    const colors = ROLE_COLORS[role.name] ?? DEFAULT_COLOR;
                    const accessCount = getAccessCount(role.name);
                    const pct = Math.round((accessCount / modules.length) * 100);
                    return (
                        <Card
                            key={role.id}
                            className={`border ${colors.border} ${colors.bg} shadow-sm transition-all hover:shadow-md`}
                        >
                            <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex items-center justify-between mb-1">
                                    <RoleIcon className={`h-5 w-5 ${colors.text}`} />
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                        {accessCount}/{modules.length} modules
                                    </span>
                                </div>
                                <CardTitle className={`text-base ${colors.text}`}>{role.name}</CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    {role.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="w-full bg-muted/40 rounded-full h-1.5 mt-1 overflow-hidden">
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
            <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Permissions Matrix</CardTitle>
                            <CardDescription className="text-sm mt-0.5">
                                Click a cell to toggle access. Hit <strong>Save Changes</strong> to persist to the database.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                    <Check className="w-3 h-3" />
                                </span>
                                Access granted
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400">
                                    <X className="w-3 h-3" />
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
                                    <TableHead className="w-[220px] border-r font-semibold text-foreground text-sm pl-6">
                                        System Module
                                    </TableHead>
                                    <TableHead className="w-16 border-r text-center text-[11px] text-muted-foreground font-normal py-2">
                                        Roles w/ Access
                                    </TableHead>
                                    {roles.map(role => {
                                        const RoleIcon = ROLE_ICONS[role.name] ?? Shield;
                                        const colors = ROLE_COLORS[role.name] ?? DEFAULT_COLOR;
                                        return (
                                            <TableHead key={role.id} className="min-w-[140px] text-center border-r last:border-r-0">
                                                <div className={`mx-2 my-1 px-3 py-2 rounded-lg ${colors.bg} ${colors.border} border`}>
                                                    <RoleIcon className={`h-4 w-4 ${colors.text} mx-auto mb-0.5`} />
                                                    <div className={`text-xs font-semibold ${colors.text}`}>{role.name}</div>
                                                </div>
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {modules.map(module => {
                                    const accessCount = getModuleAccessCount(module);
                                    return (
                                        <TableRow key={module} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium border-r bg-muted/5 pl-6 py-3 text-sm">
                                                {module}
                                            </TableCell>
                                            <TableCell className="border-r text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-muted text-muted-foreground">
                                                    {accessCount}
                                                </span>
                                            </TableCell>
                                            {roles.map(role => {
                                                const hasAccess = accessMatrix[role.name]?.[module] ?? false;
                                                // Highlight cells that differ from saved state
                                                const changed = hasAccess !== (savedMatrix[role.name]?.[module] ?? false);
                                                return (
                                                    <TableCell
                                                        key={`${module}-${role.id}`}
                                                        className={`text-center border-r last:border-r-0 py-3 transition-colors ${changed ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                                    >
                                                        <button
                                                            title={`${hasAccess ? 'Revoke' : 'Grant'} ${role.name} access to ${module}`}
                                                            onClick={() => toggleAccess(role.name, module)}
                                                            disabled={saving}
                                                            className={`
                                                                inline-flex items-center justify-center w-8 h-8 rounded-full
                                                                transition-all duration-200 hover:scale-110 focus:outline-none
                                                                focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed
                                                                ${changed ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                                                                ${hasAccess
                                                                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 focus:ring-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                    : 'bg-red-100 text-red-500 hover:bg-red-200 focus:ring-red-400 dark:bg-red-900/30 dark:text-red-400'}
                                                            `}
                                                        >
                                                            {hasAccess
                                                                ? <Check className="w-4 h-4" />
                                                                : <X className="w-4 h-4" />
                                                            }
                                                        </button>
                                                        {changed && (
                                                            <div className="text-[9px] text-amber-500 font-semibold mt-0.5 leading-none">
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background border border-border rounded-xl shadow-2xl px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-sm font-medium">Unsaved changes</span>
                    <Button size="sm" variant="outline" onClick={handleDiscard} disabled={saving}>
                        Discard
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving
                            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving…</>
                            : 'Save Changes'
                        }
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
