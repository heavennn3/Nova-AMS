import { Head } from '@inertiajs/react';
import { Webhook, Key, TerminalSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApiIntegration() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="API Integration" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Webhook className="h-8 w-8 mr-3 text-primary" />
                    API Integration & Webhooks
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage REST API access keys, webhooks, and third-party integrations for your Asset Management System.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Key className="mr-2 h-5 w-5 text-primary" />
                            Personal Access Tokens
                        </CardTitle>
                        <CardDescription>
                            Tokens you have generated that can be used to access the Nova-AMS API.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/30 border border-border rounded-lg p-6 text-left">
                            <Key className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-foreground font-medium mb-1">No Active Tokens</p>
                            <p className="text-sm text-muted-foreground mb-4">You have not created any personal access tokens yet.</p>
                            <Button variant="default">Generate New Token</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TerminalSquare className="mr-2 h-5 w-5 text-primary" />
                            API Documentation
                        </CardTitle>
                        <CardDescription>
                            Developer resources and endpoints.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm">
                            <p className="mb-2"><strong className="text-foreground">Base URL:</strong></p>
                            <code className="px-2 py-1 bg-muted rounded text-xs font-mono break-all text-primary">
                                https://api.nova-ams.test/v1
                            </code>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-3">Learn how to programmatically interact with Nova-AMS to sync assets, generate reports, and manage sites.</p>
                            <Button variant="outline" className="w-full">View API Docs</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

ApiIntegration.layout = {
    breadcrumbs: [
        {
            title: 'API Integration',
            href: '#',
        },
    ],
};
