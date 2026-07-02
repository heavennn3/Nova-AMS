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
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';

interface CreateProps {
    currentTable: string;
}

export default function TableConfigurationCreate({ currentTable }: CreateProps) {
    const [customOptions, setCustomOptions] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        table_name: currentTable,
        column_key: '',
        column_title: '',
        data_type: 'string',
        data_source: '__custom__',
        is_primary_key: false,
        is_sortable: true,
        is_filterable: true,
        is_visible: true,
        sort_order: 0,
        width: null,
        alignment: 'left',
        format_pattern: '',
        options: {},
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
        setData('data_source', data.data_source === '__custom__' ? '' : data.data_source);

        post('/master-data/table-configurations', {
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

    const commonDataSources = {
        assets: [
            { value: 'asset_id', label: 'Asset ID' },
            { value: 'product_name', label: 'Product Name' },
            { value: 'type', label: 'Type' },
            { value: 'category', label: 'Category' },
            { value: 'status', label: 'Status' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'condition_status', label: 'Condition' },
            { value: 'serial_number', label: 'Serial Number' },
            { value: 'purchase_date', label: 'Purchase Date' },
            { value: 'purchase_cost', label: 'Purchase Cost' },
            { value: 'warranty_expiry', label: 'Warranty Expiry' },
            { value: 'location', label: 'Location' },
            { value: 'assigned_to', label: 'Assigned To' },
        ],
        users: [
            { value: 'id', label: 'User ID' },
            { value: 'name', label: 'Name' },
            { value: 'email', label: 'Email' },
            { value: 'roles', label: 'Roles' },
            { value: 'is_active', label: 'Active Status' },
            { value: 'created_at', label: 'Created Date' },
        ],
    };

    const getCurrentDataSources = () => {
        return commonDataSources[currentTable as keyof typeof commonDataSources] || [];
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 p-8">
            <Head title="Add Column Configuration" />

            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href={`/master-data/table-configurations?tableName=${currentTable}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Add Column Configuration
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure a new column for the <strong>{currentTable}</strong> table
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Define the core properties of your column
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Table Name */}
                        <div className="space-y-2">
                            <Label htmlFor="table_name">Table Name</Label>
                            <Input
                                id="table_name"
                                value={data.table_name}
                                onChange={(e) => setData('table_name', e.target.value)}
                                placeholder="e.g., assets, users"
                                disabled
                                className="bg-muted"
                            />
                            {errors.table_name && (
                                <p className="text-sm text-red-600">{errors.table_name}</p>
                            )}
                        </div>

                        {/* Column Key */}
                        <div className="space-y-2">
                            <Label htmlFor="column_key">Column Key *</Label>
                            <Input
                                id="column_key"
                                value={data.column_key}
                                onChange={(e) => setData('column_key', e.target.value)}
                                placeholder="e.g., asset_id, user_name (unique identifier)"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Unique identifier for this column (use lowercase, underscores)
                            </p>
                            {errors.column_key && (
                                <p className="text-sm text-red-600">{errors.column_key}</p>
                            )}
                        </div>

                        {/* Column Title */}
                        <div className="space-y-2">
                            <Label htmlFor="column_title">Column Title *</Label>
                            <Input
                                id="column_title"
                                value={data.column_title}
                                onChange={(e) => setData('column_title', e.target.value)}
                                placeholder="e.g., Asset Tag, User Name (display name)"
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
                    </CardContent>
                </Card>

                {/* Data Source */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Source</CardTitle>
                        <CardDescription>
                            Configure where the data for this column comes from
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Quick Select Data Source */}
                        {getCurrentDataSources().length > 0 && (
                            <div className="space-y-2">
                                <Label>Quick Select Common Fields</Label>
                                <Select
                                    value={data.data_source}
                                    onValueChange={(value) => setData('data_source', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select from common fields" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__custom__">Custom field...</SelectItem>
                                        {getCurrentDataSources().map((source) => (
                                            <SelectItem key={source.value} value={source.value}>
                                                {source.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Custom Data Source */}
                        <div className="space-y-2">
                            <Label htmlFor="data_source">Custom Data Source</Label>
                            <Input
                                id="data_source"
                                value={data.data_source}
                                onChange={(e) => setData('data_source', e.target.value)}
                                placeholder="e.g., asset_id, user.name, custom_field"
                            />
                            <p className="text-xs text-muted-foreground">
                                Database field name or custom data path (leave empty for custom computed fields)
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
                    <Link href={`/master-data/table-configurations?tableName=${currentTable}`}>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="min-w-[120px]">
                        {processing ? 'Creating...' : 'Create Column'}
                    </Button>
                </div>
            </form>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Column Configuration Guide</h3>
                <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Column Key vs Data Source:</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong>Column Key:</strong> Unique ID for this configuration (e.g., "asset_tag")</li>
                        <li><strong>Data Source:</strong> Where to get data from (e.g., "asset_id" field in DB)</li>
                        <li>They can be the same, but key is for your config, source is for data</li>
                    </ul>
                    <p className="mt-3"><strong>Example:</strong> Column key "status_display" with data source "status" and format pattern "{status}"</p>
                </div>
            </div>
        </div>
    );
}

TableConfigurationCreate.layout = {
    breadcrumbs: [
        { title: 'Master Data', href: '/master-data' },
        { title: 'Table Configurations', href: '/master-data/table-configurations' },
        { title: 'Add Column', href: '#' },
    ],
};
