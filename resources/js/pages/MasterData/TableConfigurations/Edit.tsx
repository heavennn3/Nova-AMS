import { Head, Link, router, useForm } from '@inertiajs/react';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

interface TableConfiguration {
    id: number;
    table_name: string;
    column_key: string;
    column_title: string;
    data_type: string;
    data_source: string | null;
    is_primary_key: boolean;
    is_sortable: boolean;
    is_filterable: boolean;
    is_visible: boolean;
    sort_order: number;
    width: number | null;
    alignment: string;
    format_pattern: string | null;
    options: any;
}

interface EditProps {
    configuration: TableConfiguration;
}

export default function TableConfigurationEdit({ configuration }: EditProps) {
    const [customOptions, setCustomOptions] = useState(
        configuration.options ? JSON.stringify(configuration.options, null, 2) : ''
    );

    const { data, setData, put, processing, errors } = useForm({
        column_title: configuration.column_title,
        data_type: configuration.data_type,
        data_source: configuration.data_source || '',
        is_primary_key: configuration.is_primary_key,
        is_sortable: configuration.is_sortable,
        is_filterable: configuration.is_filterable,
        is_visible: configuration.is_visible,
        sort_order: configuration.sort_order,
        width: configuration.width,
        alignment: configuration.alignment,
        format_pattern: configuration.format_pattern || '',
        options: configuration.options || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse custom options if provided
        let parsedOptions = {};
        if (customOptions.trim()) {
            try {
                parsedOptions = JSON.parse(customOptions);
            } catch (err) {
                alert('Invalid JSON in custom options. Please check your syntax.');
                return;
            }
        }

        setData('options', parsedOptions);

        put(`/master-data/table-configurations/${configuration.id}`, {
            onSuccess: () => {
                router.reload({ only: ['configurations'] });
            },
        });
    };

    const dataTypes = [
        { value: 'string', label: 'Text', icon: '📝' },
        { value: 'number', label: 'Number', icon: '🔢' },
        { value: 'date', label: 'Date', icon: '📅' },
        { value: 'boolean', label: 'True/False', icon: '✅' },
        { value: 'enum', label: 'Enum/Select', icon: '🏷️' },
        { value: 'array', label: 'Array/List', icon: '📚' },
    ];

    const alignments = ['left', 'center', 'right'];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 p-8">
            <Head title={`Edit ${configuration.column_title}`} />

            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href={`/master-data/table-configurations?tableName=${configuration.table_name}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Edit Column Configuration
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure <strong>{configuration.column_title}</strong> column
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Read-only Info */}
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle>Column Identity (Cannot be changed)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Table Name</Label>
                                <p className="font-medium">{configuration.table_name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Column Key</Label>
                                <p className="font-medium font-mono">{configuration.column_key}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Editable Properties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Properties</CardTitle>
                        <CardDescription>
                            Modify the display and behavior properties
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Column Title */}
                        <div className="space-y-2">
                            <Label htmlFor="column_title">Column Title *</Label>
                            <Input
                                id="column_title"
                                value={data.column_title}
                                onChange={(e) => setData('column_title', e.target.value)}
                                placeholder="e.g., Asset Tag, User Name"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                The display name that users will see in the table header
                            </p>
                            {errors.column_title && (
                                <p className="text-sm text-red-600">{errors.column_title}</p>
                            )}
                        </div>

                        {/* Data Type */}
                        <div className="space-y-2">
                            <Label htmlFor="data_type">Data Type *</Label>
                            <Select
                                value={data.data_type}
                                onValueChange={(value) => setData('data_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dataTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <span className="flex items-center gap-2">
                                                <span>{type.icon}</span>
                                                <span>{type.label}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.data_type && (
                                <p className="text-sm text-red-600">{errors.data_type}</p>
                            )}
                        </div>

                        {/* Data Source */}
                        <div className="space-y-2">
                            <Label htmlFor="data_source">Data Source</Label>
                            <Input
                                id="data_source"
                                value={data.data_source}
                                onChange={(e) => setData('data_source', e.target.value)}
                                placeholder="e.g., asset_id, user.name, custom_field"
                            />
                            <p className="text-xs text-muted-foreground">
                                Database field name or custom data path
                            </p>
                            {errors.data_source && (
                                <p className="text-sm text-red-600">{errors.data_source}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Column Properties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Column Properties</CardTitle>
                        <CardDescription>
                            Configure how this column behaves in the table
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Boolean Properties */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_primary_key"
                                    checked={data.is_primary_key}
                                    onCheckedChange={(checked) =>
                                        setData('is_primary_key', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_primary_key" className="cursor-pointer">
                                    Primary Key Column
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Mark this as the main identifier column (usually only one per table)
                            </p>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_sortable"
                                    checked={data.is_sortable}
                                    onCheckedChange={(checked) =>
                                        setData('is_sortable', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_sortable" className="cursor-pointer">
                                    Sortable
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_filterable"
                                    checked={data.is_filterable}
                                    onCheckedChange={(checked) =>
                                        setData('is_filterable', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_filterable" className="cursor-pointer">
                                    Filterable
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_visible"
                                    checked={data.is_visible}
                                    onCheckedChange={(checked) =>
                                        setData('is_visible', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_visible" className="cursor-pointer">
                                    Visible by Default
                                </Label>
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Display Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                min="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower numbers appear first (0, 1, 2, etc.)
                            </p>
                            {errors.sort_order && (
                                <p className="text-sm text-red-600">{errors.sort_order}</p>
                            )}
                        </div>

                        {/* Alignment */}
                        <div className="space-y-2">
                            <Label htmlFor="alignment">Text Alignment</Label>
                            <Select
                                value={data.alignment}
                                onValueChange={(value) => setData('alignment', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select alignment" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alignments.map((align) => (
                                        <SelectItem key={align} value={align}>
                                            {align.charAt(0).toUpperCase() + align.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.alignment && (
                                <p className="text-sm text-red-600">{errors.alignment}</p>
                            )}
                        </div>

                        {/* Width */}
                        <div className="space-y-2">
                            <Label htmlFor="width">Column Width (pixels)</Label>
                            <Input
                                id="width"
                                type="number"
                                value={data.width || ''}
                                onChange={(e) => setData('width', e.target.value ? parseInt(e.target.value) : null)}
                                min="50"
                                max="500"
                                placeholder="Auto"
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for automatic width (min: 50px, max: 500px)
                            </p>
                            {errors.width && (
                                <p className="text-sm text-red-600">{errors.width}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Options */}
                <Card>
                    <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                        <CardDescription>
                            Additional formatting and customization options
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Format Pattern */}
                        <div className="space-y-2">
                            <Label htmlFor="format_pattern">Format Pattern</Label>
                            <Input
                                id="format_pattern"
                                value={data.format_pattern}
                                onChange={(e) => setData('format_pattern', e.target.value)}
                                placeholder="e.g., YYYY-MM-DD, $#,##0.00, {status}"
                            />
                            <p className="text-xs text-muted-foreground">
                                Date format, number format, or template pattern
                            </p>
                            {errors.format_pattern && (
                                <p className="text-sm text-red-600">{errors.format_pattern}</p>
                            )}
                        </div>

                        {/* Custom Options (JSON) */}
                        <div className="space-y-2">
                            <Label htmlFor="options">Custom Options (JSON)</Label>
                            <Textarea
                                id="options"
                                value={customOptions}
                                onChange={(e) => setCustomOptions(e.target.value)}
                                placeholder='{"enum_values": ["Option1", "Option2"], "custom_css": "text-blue-600"}'
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Additional configuration options as JSON (e.g., enum values, custom CSS classes)
                            </p>
                            {errors.options && (
                                <p className="text-sm text-red-600">{errors.options}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <Link href={`/master-data/table-configurations?tableName=${configuration.table_name}`}>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="min-w-[120px]">
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>

            {/* Current Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Current Configuration</h3>
                <div className="text-sm text-blue-800">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <strong>Table:</strong> {configuration.table_name}
                        </div>
                        <div>
                            <strong>Key:</strong> {configuration.column_key}
                        </div>
                        <div>
                            <strong>Type:</strong> {configuration.data_type}
                        </div>
                        <div>
                            <strong>Order:</strong> {configuration.sort_order}
                        </div>
                        <div>
                            <strong>Visible:</strong> {configuration.is_visible ? 'Yes' : 'No'}
                        </div>
                        <div>
                            <strong>Sortable:</strong> {configuration.is_sortable ? 'Yes' : 'No'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

TableConfigurationEdit.layout = {
    breadcrumbs: [
        { title: 'Master Data', href: '/master-data' },
        { title: 'Table Configurations', href: '/master-data/table-configurations' },
        { title: 'Edit Column', href: '#' },
    ],
};
