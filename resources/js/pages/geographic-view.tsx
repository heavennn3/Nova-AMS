import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    MapPin,
    Globe,
    Activity,
    Navigation,
    Info,
    Edit2,
    Check,
    X,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function GeographicView({ sites = [] }: { sites: any[] }) {
    const { auth }: any = usePage().props;
    const isAdmin = auth.user?.roles?.includes('Admin');

    const [selectedSite, setSelectedSite] = useState<any>(sites[0] || null);
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        latitude: selectedSite?.latitude || '',
        longitude: selectedSite?.longitude || '',
    });

    // Update form data when selected site changes
    useEffect(() => {
        setData({
            latitude: selectedSite?.latitude || '',
            longitude: selectedSite?.longitude || '',
        });
        setIsEditing(false);
    }, [selectedSite]);

    const getGoogleMapsEmbedUrl = (site: any) => {
        if (!site || !site.latitude || !site.longitude) {
            return `https://maps.google.com/maps?q=${encodeURIComponent(site?.name || 'Malaysia')}&z=19&output=embed`;
        }
        return `https://maps.google.com/maps?q=${site.latitude},${site.longitude}&z=19&output=embed`;
    };

    const handleUpdateLocation = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('sites.update-location', selectedSite.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                toast.success('Location pinned successfully');
            },
        });
    };

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Geographic View" />

            <div className="flex items-end justify-between">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Globe className="mr-3 h-8 w-8 text-primary" />
                        Site Location
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Geospatial distribution of operational sites across
                        Sabah & Sarawak
                    </p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
                    <p className="text-sm font-semibold text-primary">
                        Total Sites: {sites.length}
                    </p>
                </div>
            </div>

            <div className="grid h-[600px] grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Site List Sidebar */}
                <div className="custom-scrollbar space-y-4 overflow-y-auto pr-2 lg:col-span-1">
                    {sites.map((site) => (
                        <Card
                            key={site.id}
                            className={`cursor-pointer transition-all hover:border-primary/50 ${selectedSite?.id === site.id ? 'border-primary shadow-md ring-1 ring-primary' : ''}`}
                            onClick={() => setSelectedSite(site)}
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="flex items-center justify-between text-sm">
                                    {site.name}
                                    {selectedSite?.id === site.id && (
                                        <Navigation className="h-3 w-3 animate-pulse text-primary" />
                                    )}
                                </CardTitle>
                                <CardDescription className="text-xs font-bold text-muted-foreground/70 uppercase">
                                    {site.code} • {site.region}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Map Display Area */}
                <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:col-span-3">
                    {selectedSite ? (
                        <>
                            <div className="w-full flex-1 bg-muted/20">
                                <iframe
                                    title={`Map of ${selectedSite.name}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    src={getGoogleMapsEmbedUrl(selectedSite)}
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Site Info & Pinned Location Controls */}
                            <div className="absolute top-4 right-4 w-72 space-y-4 rounded-lg border bg-background/90 p-4 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            <Info className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-bold">
                                            {selectedSite.name}
                                        </h3>
                                    </div>
                                    {isAdmin && !isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form
                                        onSubmit={handleUpdateLocation}
                                        className="space-y-3"
                                    >
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="latitude"
                                                className="text-xs"
                                            >
                                                Latitude
                                            </Label>
                                            <Input
                                                id="latitude"
                                                value={data.latitude}
                                                onChange={(e) =>
                                                    setData(
                                                        'latitude',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-xs"
                                                placeholder="e.g. 5.9804"
                                            />
                                            {errors.latitude && (
                                                <p className="text-[10px] text-red-500">
                                                    {errors.latitude}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="longitude"
                                                className="text-xs"
                                            >
                                                Longitude
                                            </Label>
                                            <Input
                                                id="longitude"
                                                value={data.longitude}
                                                onChange={(e) =>
                                                    setData(
                                                        'longitude',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-8 text-xs"
                                                placeholder="e.g. 116.0735"
                                            />
                                            {errors.longitude && (
                                                <p className="text-[10px] text-red-500">
                                                    {errors.longitude}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="h-8 flex-1"
                                                disabled={processing}
                                            >
                                                <Check className="mr-1 h-3 w-3" />{' '}
                                                Save
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 flex-1"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    reset();
                                                }}
                                            >
                                                <X className="mr-1 h-3 w-3" />{' '}
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="space-y-2 text-xs">
                                            <p className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Coordinates:
                                                </span>
                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                                    {selectedSite.latitude ||
                                                        '5.937897941956195'}
                                                    ,{' '}
                                                    {selectedSite.longitude ||
                                                        '116.0550073053758'}
                                                </span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Status:
                                                </span>
                                                <span className="font-bold text-emerald-600">
                                                    Operational
                                                </span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Total Assets:
                                                </span>
                                                <span className="font-bold">
                                                    {selectedSite.assets_count ||
                                                        0}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Button
                                                className="h-8 w-full text-xs"
                                                variant="outline"
                                                asChild
                                            >
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedSite.latitude || selectedSite.name},${selectedSite.longitude || ''}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View on Google Maps
                                                </a>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
                            <MapPin className="h-12 w-12 text-muted-foreground/30" />
                            <p className="font-medium text-muted-foreground">
                                Select a site to view its location
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

GeographicView.layout = {
    breadcrumbs: [
        {
            title: 'Geographic View',
            href: '#',
        },
    ],
};
