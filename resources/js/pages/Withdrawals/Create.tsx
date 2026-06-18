import { Head, Link, useForm } from '@inertiajs/react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Clock, AlertCircle, CheckCircle, Calendar, User } from 'lucide-react';
import { useState } from 'react';

export default function WithdrawalCreate({
    assets = [],
    typeOptions = {},
    purposeOptions = {},
    durationPresets = {},
    priorityOptions = {},
    currentUser = null,
}: {
    assets: any[];
    typeOptions: any;
    purposeOptions: any;
    durationPresets: any;
    priorityOptions: any;
    currentUser: any;
}) {
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [selectedDuration, setSelectedDuration] = useState('');
    const [customReturnDate, setCustomReturnDate] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        asset_id: '',
        withdrawal_type: 'standard',
        purpose_category: 'operational',
        purpose_description: '',
        withdrawal_date: new Date().toISOString().split('T')[0],
        duration_preset: '',
        expected_return_date: '',
        priority: 'normal',
        condition_notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedDuration) {
            setData('duration_preset', selectedDuration);
        }

        if (customReturnDate) {
            setData('expected_return_date', customReturnDate);
        }

        post('/withdrawals', {
            onSuccess: () => {
                // Handle success
            },
            onError: (errors) => {
                console.error('Errors:', errors);
            }
        });
    };

    const handleAssetChange = (assetId: string) => {
        const asset = assets.find((a: any) => a.id.toString() === assetId);
        setSelectedAsset(asset);
        setData('asset_id', assetId);
    };

    const handleDurationChange = (duration: string) => {
        setSelectedDuration(duration);
        if (duration !== 'custom') {
            const preset = durationPresets[duration];
            if (preset && preset.days) {
                const returnDate = new Date();
                returnDate.setDate(returnDate.getDate() + preset.days);
                setData('expected_return_date', returnDate.toISOString().split('T')[0]);
                setCustomReturnDate('');
            } else if (duration === 'permanent') {
                setData('expected_return_date', '');
                setCustomReturnDate('');
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 p-8">
            <Head title="Withdraw Asset" />

            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/withdrawals">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Withdraw Asset
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Check out asset with proper tracking and duration
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Information Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">Withdrawal by: {currentUser?.name}</p>
                                <p className="text-xs text-blue-600">{currentUser?.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Asset Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="asset_id">Select Asset to Withdraw *</Label>
                            <Select value={data.asset_id} onValueChange={handleAssetChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an asset..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map((asset: any) => (
                                        <SelectItem
                                            key={asset.id}
                                            value={asset.id.toString()}
                                            disabled={!asset.available}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{asset.product_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ID: {asset.asset_id} | {asset.category} | {asset.site}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.asset_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.asset_id}</p>
                            )}
                        </div>

                        {selectedAsset && (
                            <div className="p-4 bg-slate-50 rounded-lg border">
                                <h4 className="font-medium mb-2">Selected Asset Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Asset ID:</span>
                                        <span className="ml-2 font-medium">{selectedAsset.asset_id}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="ml-2 font-medium">{selectedAsset.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Site:</span>
                                        <span className="ml-2 font-medium">{selectedAsset.site}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Current Status:</span>
                                        <span className="ml-2 font-medium">{selectedAsset.current_status}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Withdrawal Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="withdrawal_type">Withdrawal Type *</Label>
                                <Select
                                    value={data.withdrawal_type}
                                    onValueChange={(value) => setData('withdrawal_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(typeOptions).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.withdrawal_type && (
                                    <p className="text-sm text-red-500 mt-1">{errors.withdrawal_type}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="purpose_category">Purpose Category *</Label>
                                <Select
                                    value={data.purpose_category}
                                    onValueChange={(value) => setData('purpose_category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(purposeOptions).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.purpose_category && (
                                    <p className="text-sm text-red-500 mt-1">{errors.purpose_category}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="purpose_description">Purpose Description *</Label>
                            <Textarea
                                id="purpose_description"
                                value={data.purpose_description}
                                onChange={(e) => setData('purpose_description', e.target.value)}
                                placeholder="Provide detailed description of why you need this asset (min. 10 characters)..."
                                rows={3}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {data.purpose_description.length}/500 characters
                            </p>
                            {errors.purpose_description && (
                                <p className="text-sm text-red-500 mt-1">{errors.purpose_description}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="withdrawal_date">Withdrawal Date *</Label>
                            <Input
                                id="withdrawal_date"
                                type="date"
                                value={data.withdrawal_date}
                                onChange={(e) => setData('withdrawal_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.withdrawal_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.withdrawal_date}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Duration & Return */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Duration & Return
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="duration_preset">Duration Preset</Label>
                            <Select
                                value={selectedDuration}
                                onValueChange={handleDurationChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(durationPresets).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value.label}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">
                                        Custom Date...
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Select preset duration or choose custom date
                            </p>
                        </div>

                        {selectedDuration === 'custom' && (
                            <div>
                                <Label htmlFor="expected_return_date">Expected Return Date</Label>
                                <Input
                                    id="expected_return_date"
                                    type="date"
                                    value={customReturnDate}
                                    onChange={(e) => {
                                        setCustomReturnDate(e.target.value);
                                        setData('expected_return_date', e.target.value);
                                    }}
                                    min={data.withdrawal_date}
                                />
                                {errors.expected_return_date && (
                                    <p className="text-sm text-red-500 mt-1">{errors.expected_return_date}</p>
                                )}
                            </div>
                        )}

                        {data.expected_return_date && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Expected Return: {data.expected_return_date}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            {selectedDuration !== 'permanent' && selectedDuration !== 'custom' && durationPresets[selectedDuration]?.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Priority & Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="priority">Priority Level *</Label>
                            <Select
                                value={data.priority}
                                onValueChange={(value) => setData('priority', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(priorityOptions).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.priority && (
                                <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="condition_notes">Condition Notes</Label>
                            <Textarea
                                id="condition_notes"
                                value={data.condition_notes}
                                onChange={(e) => setData('condition_notes', e.target.value)}
                                placeholder="Note any existing conditions or special handling required..."
                                rows={2}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Optional: Describe asset condition before withdrawal
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link href="/withdrawals">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing || !data.asset_id}>
                        {processing ? 'Processing...' : 'Confirm Withdrawal'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

WithdrawalCreate.layout = {
    breadcrumbs: [
        {
            title: 'Withdrawals',
            href: '/withdrawals',
        },
        {
            title: 'Create',
            href: '#',
        },
    ],
};