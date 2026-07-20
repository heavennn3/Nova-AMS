import { Head, Link } from '@inertiajs/react';
import {
    Paintbrush,
    FileText,
    ShieldCheck,
    Users,
    Globe,
    Bell,
    Terminal,
    Hash,
    QrCode,
    Network,
    Chrome,
    KeyRound,
    Database,
    History,
    Cpu,
    Trash2,
    Settings as SettingsIcon,
    Server,
    ExternalLink,
    Info,
    Check,
    X,
    MapPin,
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

interface SystemInfo {
    novaAmsVersion: string;
    phpVersion: string;
    laravelVersion: string;
    databaseDriver: string;
    timezone: string;
    mailFromAddress: string;
    mailReplyToAddress: string;
    apiBaseUrl: string;
    scimBaseUrl: string;
    tableStorage: string;
}

export default function AdminSettings({ systemInfo }: { systemInfo: SystemInfo }) {
    const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
    const [settingConfig, setSettingConfig] = useState<any>({});

    const settingsItems = [


        {
            id: 'security',
            title: 'Profile',
            description: 'Edit Profile ',
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            link: '/settings/security',
        },
        {
            id: 'groups',
            title: 'Access Control',
            description: 'Account permission groups',
            icon: Users,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            link: '/security/roles',
        },

        {
            id: 'sites',
            title: 'Sites',
            description: 'Manage sites, locations, and site administrators',
            icon: MapPin,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            link: '/multi-site/dashboards',
        },



        {
            id: 'login_attempts',
            title: 'Logs',
            description: 'List of attempted logins',
            icon: History,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            link: '/security/logs',
        },

        {
            id: 'purge',
            title: 'Trash ',
            description: 'View Deleted Item',
            icon: Trash2,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            link: '/security/recycle-bin',
            accent: true,
        },
    ];

    const handleItemClick = (item: typeof settingsItems[0]) => {
        if (item.link) {
            return; // Managed by Inertia <Link>
        }

        setSelectedSetting(item.id);
        const defaults: any = {};
        item.fields?.forEach((f) => {
            defaults[f.name] = f.defaultValue;
        });
        setSettingConfig(defaults);
    };

    const handleSave = () => {
        toast.success('Configuration saved successfully');
        setSelectedSetting(null);
    };

    const activeItem = settingsItems.find((item) => item.id === selectedSetting);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Superadmin Settings" />

            {/* Header */}
            <div className="flex items-center space-x-3 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Admin Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Nova AMS System Setting
                    </p>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {settingsItems.map((item) => {
                    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
                        if (item.link) {
                            return (
                                <Link href={item.link} className="block group">
                                    {children}
                                </Link>
                            );
                        }

                        return (
                            <div
                                onClick={() => handleItemClick(item)}
                                className="block group cursor-pointer"
                            >
                                {children}
                            </div>
                        );
                    };

                    return (
                        <CardWrapper key={item.id}>
                            <Card className="h-full border border-border bg-card/40 transition-all duration-300 hover:scale-[1.02] hover:bg-accent/40 hover:shadow-md">
                                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className={`mb-3 rounded-xl p-3 ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </CardWrapper>
                    );
                })}
            </div>

            {/* System Information Card */}
            <Card className="border border-border/80 bg-card/25 shadow-sm">
                <CardHeader className="flex flex-row items-center space-x-2 border-b border-border/60 bg-muted/40 p-4">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold text-foreground">
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 text-sm">
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Nova-AMS version:</span>
                                <span className="font-mono text-xs text-foreground bg-accent px-2 py-0.5 rounded">
                                    {systemInfo.novaAmsVersion}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">PHP Version:</span>
                                <span className="font-mono text-xs text-foreground">{systemInfo.phpVersion}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Laravel Version:</span>
                                <span className="font-mono text-xs text-foreground">{systemInfo.laravelVersion}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Database Driver:</span>
                                <span className="font-mono text-xs text-foreground">{systemInfo.databaseDriver}</span>
                            </div>

                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Mail From Address:</span>
                                <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={systemInfo.mailFromAddress}>
                                    {systemInfo.mailFromAddress}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Mail Reply-To Address:</span>
                                <span className="font-mono text-xs text-foreground truncate max-w-[200px]" title={systemInfo.mailReplyToAddress}>
                                    {systemInfo.mailReplyToAddress}
                                </span>
                            </div>


                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Table Storage:</span>
                                <span className="font-mono text-xs text-foreground">{systemInfo.tableStorage}</span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="font-medium text-muted-foreground">Timezone:</span>
                                <span className="font-mono text-xs text-foreground">{systemInfo.timezone}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Config Dialog */}
            <Dialog open={selectedSetting !== null} onOpenChange={(open) => !open && setSelectedSetting(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            {activeItem && <activeItem.icon className={`h-5 w-5 ${activeItem.color}`} />}
                            <span>Configure {activeItem?.title}</span>
                        </DialogTitle>
                        <DialogDescription>
                            Configure standard {activeItem?.title} preferences below. Click save to persist settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 text-left">
                        {activeItem?.fields?.map((field: any) => (
                            <div key={field.name} className="flex flex-col gap-2">
                                <Label htmlFor={field.name} className="text-left font-medium">
                                    {field.label}
                                </Label>
                                {field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        value={settingConfig[field.name] || ''}
                                        onChange={(e) => setSettingConfig({ ...settingConfig, [field.name]: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {field.options.map((opt: string) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        rows={3}
                                        value={settingConfig[field.name] || ''}
                                        onChange={(e) => setSettingConfig({ ...settingConfig, [field.name]: e.target.value })}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                ) : field.type === 'checkbox' ? (
                                    <div className="flex items-center space-x-2 py-1">
                                        <input
                                            type="checkbox"
                                            id={field.name}
                                            checked={!!settingConfig[field.name]}
                                            onChange={(e) => setSettingConfig({ ...settingConfig, [field.name]: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-muted-foreground">Enable option</span>
                                    </div>
                                ) : (
                                    <Input
                                        id={field.name}
                                        type={field.type}
                                        value={settingConfig[field.name] || ''}
                                        onChange={(e) => setSettingConfig({ ...settingConfig, [field.name]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedSetting(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

AdminSettings.layout = {
    breadcrumbs: [
        {
            title: 'Admin Settings',
            href: '/settings',
        },
    ],
};
