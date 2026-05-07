import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { MapPin, Globe, Activity, Navigation, Info, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Geographic View" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <Globe className="h-8 w-8 mr-3 text-primary" />
                        Priview Site Location
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Geospatial distribution of operational sites across Sabah & Sarawak
                    </p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary">Total Sites: {sites.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Site List Sidebar */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {sites.map(site => (
                        <Card 
                            key={site.id} 
                            className={`cursor-pointer transition-all hover:border-primary/50 ${selectedSite?.id === site.id ? 'border-primary ring-1 ring-primary shadow-md' : ''}`}
                            onClick={() => setSelectedSite(site)}
                        >
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    {site.name}
                                    {selectedSite?.id === site.id && <Navigation className="h-3 w-3 text-primary animate-pulse" />}
                                </CardTitle>
                                <CardDescription className="text-xs uppercase font-bold text-muted-foreground/70">
                                    {site.code} • {site.region}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Map Display Area */}
                <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col relative">
                    {selectedSite ? (
                        <>
                            <div className="flex-1 w-full bg-muted/20">
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
                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border shadow-lg w-72 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                                            <Info className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-sm">{selectedSite.name}</h3>
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
                                    <form onSubmit={handleUpdateLocation} className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                                            <Input 
                                                id="latitude"
                                                value={data.latitude}
                                                onChange={e => setData('latitude', e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="e.g. 5.9804"
                                            />
                                            {errors.latitude && <p className="text-[10px] text-red-500">{errors.latitude}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                                            <Input 
                                                id="longitude"
                                                value={data.longitude}
                                                onChange={e => setData('longitude', e.target.value)}
                                                className="h-8 text-xs"
                                                placeholder="e.g. 116.0735"
                                            />
                                            {errors.longitude && <p className="text-[10px] text-red-500">{errors.longitude}</p>}
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <Button type="submit" size="sm" className="flex-1 h-8" disabled={processing}>
                                                <Check className="h-3 w-3 mr-1" /> Save
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 h-8"
                                                onClick={() => { setIsEditing(false); reset(); }}
                                            >
                                                <X className="h-3 w-3 mr-1" /> Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="space-y-2 text-xs">
                                            <p className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">Coordinates:</span>
                                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                                    {selectedSite.latitude || '5.937897941956195'}, {selectedSite.longitude || '116.0550073053758'}
                                                </span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">Status:</span>
                                                <span className="text-emerald-600 font-bold">Operational</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">Total Assets:</span>
                                                <span className="font-bold">{selectedSite.assets_count || 0}</span>
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Button className="w-full h-8 text-xs" variant="outline" asChild>
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
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <MapPin className="h-12 w-12 text-muted-foreground/30" />
                            <p className="text-muted-foreground font-medium">Select a site to view its location</p>
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
