import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({
    asset,
    configurations = [],
}: any) {
    const getInitialData = () => {
        const base: Record<string, any> = {};
        for (const c of configurations) {
            base[c.column_key] = asset[c.column_key] ?? '';
        }
        return base;
    };

    const { data, setData, put, processing, errors } = useForm(getInitialData());

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/assets/${asset.id}`, {
            preserveScroll: true,
        });
    };

    const pkConfig = configurations?.find((c: any) => c.is_primary_key);
    const pkValue = pkConfig ? data[pkConfig.column_key] : '';

    function renderField(config: any, data: any, setData: any, errors: any) {
        const key = config.column_key;
        const label = config.column_title || key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
        const required = config.is_primary_key;

        if (config.data_type === 'boolean') {
            return (
                <div key={key} className="space-y-2">
                    <Label className="font-medium">{label}</Label>
                    <Select
                        value={data[key]?.toString() || ''}
                        onValueChange={(val) => setData(key, val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Yes</SelectItem>
                            <SelectItem value="0">No</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
                </div>
            );
        }

        if (config.data_type === 'date') {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="font-medium">
                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        id={key}
                        type="date"
                        value={data[key] || ''}
                        onChange={(e) => setData(key, e.target.value)}
                        className="h-9"
                    />
                    {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
                </div>
            );
        }

        if (config.data_type === 'number') {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="font-medium">
                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        id={key}
                        type="number"
                        value={data[key] || ''}
                        onChange={(e) => setData(key, e.target.value)}
                        className="h-9"
                    />
                    {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <Label htmlFor={key} className="font-medium">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {config.data_type === 'text' || key === 'notes' ? (
                    <Textarea
                        id={key}
                        value={data[key] || ''}
                        onChange={(e) => setData(key, e.target.value)}
                        rows={3}
                    />
                ) : (
                    <Input
                        id={key}
                        value={data[key] || ''}
                        onChange={(e) => setData(key, e.target.value)}
                        className="h-9"
                    />
                )}
                {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <Head title={`Edit Asset${pkValue ? ` - ${pkValue}` : ''}`} />

            <div className="flex items-center gap-4">
                <Link
                    href="/assets"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Asset</h1>
                    <p className="text-sm text-muted-foreground">
                        Update asset details.
                    </p>
                </div>
            </div>

            <Separator />

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {configurations?.map((cfg: any) => renderField(cfg, data, setData, errors))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/assets">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="min-w-[120px]">
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = {
    breadcrumbs: [{ title: 'Edit', href: '#' }],
};
