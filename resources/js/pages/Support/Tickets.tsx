import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Headset,
    Search,
    Send,
    User,
    CheckCircle2,
    Clock,
    Plus,
    X,
    AlertCircle,
    Loader2,
    MessageSquare,
    History,
    Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TicketMessage {
    id: number;
    user_id: number;
    message: string;
    is_system: boolean;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface SupportTicket {
    id: number;
    user_id: number;
    subject: string;
    category: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    assigned_to?: number;
}

interface Props {
    tickets: SupportTicket[];
    isAdmin: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    if (!iso) return '';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
        });
    } catch {
        return '';
    }
}

function formatTime(iso: string): string {
    if (!iso) return '';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

function initials(name: string): string {
    if (!name) return '??';
    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Tickets({ tickets = [], isAdmin }: Props) {
    const { auth } = usePage().props as any;
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
        null,
    );
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const scrollRef = useRef<HTMLDivElement>(null);

    // Forms
    const {
        data: msgData,
        setData: setMsgData,
        post: postMsg,
        processing: postingMsg,
        reset: resetMsg,
    } = useForm({
        message: '',
    });

    const {
        data: ticketData,
        setData: setTicketData,
        post: postTicket,
        processing: creatingTicket,
        reset: resetTicket,
    } = useForm({
        subject: '',
        category: 'General',
        priority: 'medium',
        message: '',
    });

    // ── Filter & Tabs ─────────────────────────────────────────────────────

    const filteredTickets = useMemo(() => {
        return (tickets || []).filter((t) => {
            const matchesSearch =
                (t.subject || '')
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                t.id.toString().includes(search) ||
                (t.user?.name || '')
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const isPast = t.status === 'resolved' || t.status === 'closed';
            const matchesTab = activeTab === 'active' ? !isPast : isPast;

            return matchesSearch && matchesTab;
        });
    }, [tickets, search, activeTab]);

    // When switching tabs or tickets list changes, select first if current not in view
    useEffect(() => {
        if (!selectedTicket && filteredTickets.length > 0) {
            setSelectedTicket(filteredTickets[0]);
        } else if (
            selectedTicket &&
            !filteredTickets.find((t) => t.id === selectedTicket.id)
        ) {
            // Selected ticket is not in current filtered list, keep it but maybe it's hidden
        }
    }, [filteredTickets]);

    // ── Fetch Messages ────────────────────────────────────────────────────

    const fetchMessages = async (ticketId: number) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/support/tickets/${ticketId}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            console.error('Failed to fetch messages', err);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
        } else {
            setMessages([]);
        }
    }, [selectedTicket?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // ── Actions ────────────────────────────────────────────────────────────

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !msgData.message.trim()) return;

        postMsg(`/support/tickets/${selectedTicket.id}/message`, {
            preserveScroll: true,
            onSuccess: () => {
                resetMsg();
                fetchMessages(selectedTicket.id);
            },
        });
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        postTicket('/support/tickets', {
            onSuccess: () => {
                setCreateOpen(false);
                resetTicket();
                setActiveTab('active');
            },
        });
    };

    const handleUpdateStatus = (status: string) => {
        if (!selectedTicket) return;
        router.patch(
            `/support/tickets/${selectedTicket.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const updated = {
                        ...selectedTicket,
                        status: status as any,
                    };
                    setSelectedTicket(updated);
                    router.reload({ only: ['tickets'] });
                },
            },
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col space-y-6 p-6">
            <Head title="Live Support & Tickets" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Headset className="mr-3 h-8 w-8 text-primary" />
                        Live Support & Helpdesk
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin
                            ? 'Report Issues and Chat with Technical Team'
                            : 'Get help from our technical team'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="shadow-lg transition-all hover:shadow-xl"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Ticket
                    </Button>
                )}
            </div>

            <div className="flex min-h-0 flex-1 gap-6">
                {/* Tickets Sidebar */}
                <Card className="flex w-80 flex-col overflow-hidden border-border shadow-md">
                    <div className="space-y-3 border-b border-border bg-muted/20 p-4">
                        {/* Tab Switcher */}
                        <div className="flex w-full rounded-lg bg-muted p-1">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-bold transition-all ${activeTab === 'active'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Activity className="h-3.5 w-3.5" />
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-bold transition-all ${activeTab === 'past'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <History className="h-3.5 w-3.5" />
                                Past
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 pl-9 text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex-1 divide-y divide-border/50 overflow-y-auto">
                        {filteredTickets.length === 0 ? (
                            <div className="p-12 text-center text-xs text-muted-foreground">
                                <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-10" />
                                No {activeTab} tickets found
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full p-4 text-left transition-all hover:bg-muted/30 ${selectedTicket?.id === ticket.id ? 'border-l-4 border-l-primary bg-primary/5' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="mb-1.5 flex items-start justify-between">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1.5 font-mono text-[10px] opacity-70"
                                        >
                                            #{ticket.id}
                                        </Badge>
                                        <span className="text-[10px] font-medium text-muted-foreground">
                                            {timeAgo(ticket.created_at)}
                                        </span>
                                    </div>
                                    <div className="mb-1 truncate text-sm font-semibold text-foreground">
                                        {ticket.subject}
                                    </div>
                                    {isAdmin && (
                                        <div className="mb-2 text-[10px] text-muted-foreground italic">
                                            User:{' '}
                                            {ticket.user?.name || 'Unknown'}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`border-0 px-1.5 py-0 text-[9px] font-bold uppercase ${ticket.status === 'open'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : ticket.status ===
                                                        'in_progress'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : ticket.status ===
                                                            'resolved'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {(ticket.status || 'open').replace(
                                                '_',
                                                ' ',
                                            )}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`border-border px-1.5 py-0 text-[9px] font-medium uppercase ${ticket.priority === 'urgent'
                                                    ? 'bg-red-50 text-red-600'
                                                    : ticket.priority === 'high'
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : 'text-muted-foreground'
                                                }`}
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card className="flex flex-1 flex-col overflow-hidden border-border bg-background shadow-md">
                    {selectedTicket ? (
                        <>
                            <div className="z-10 flex items-center justify-between border-b border-border bg-muted/5 p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-lg p-2 ${selectedTicket.status === 'resolved'
                                                ? 'bg-emerald-100'
                                                : 'bg-primary/10'
                                            }`}
                                    >
                                        <MessageSquare
                                            className={`h-5 w-5 ${selectedTicket.status ===
                                                    'resolved'
                                                    ? 'text-emerald-600'
                                                    : 'text-primary'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg leading-none font-bold">
                                            {selectedTicket.subject}
                                        </h2>
                                        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                #{selectedTicket.id}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                Category:{' '}
                                                {selectedTicket.category}
                                            </span>
                                            <span>•</span>
                                            <span
                                                className={`uppercase ${selectedTicket.status ===
                                                        'resolved'
                                                        ? 'text-emerald-600'
                                                        : 'text-primary'
                                                    }`}
                                            >
                                                Status:{' '}
                                                {(
                                                    selectedTicket.status ||
                                                    'open'
                                                ).replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(isAdmin ||
                                        selectedTicket.user_id ===
                                        auth.user.id) &&
                                        selectedTicket.status !==
                                        'resolved' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        'resolved',
                                                    )
                                                }
                                                className="h-8 border-emerald-200 text-xs font-bold text-emerald-600 hover:bg-emerald-50"
                                            >
                                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                                Mark as Resolved
                                            </Button>
                                        )}
                                </div>
                            </div>

                            <div
                                ref={scrollRef}
                                className="flex-1 space-y-6 overflow-y-auto bg-secondary/5 p-6"
                            >
                                {loadingMessages ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center space-y-2 text-center text-muted-foreground">
                                        <AlertCircle className="h-12 w-12 opacity-5" />
                                        <p className="text-sm font-medium opacity-40">
                                            No messages yet.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe =
                                            msg.user_id === auth.user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`flex max-w-[80%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    <div className="flex-shrink-0">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ${isMe
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                                }`}
                                                        >
                                                            {initials(
                                                                msg.user
                                                                    ?.name ||
                                                                'Unknown',
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                                    >
                                                        {!isMe && (
                                                            <span className="mb-1 ml-1 text-[10px] font-bold text-muted-foreground">
                                                                {msg.user
                                                                    ?.name ||
                                                                    'Unknown'}
                                                            </span>
                                                        )}
                                                        <div
                                                            className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${isMe
                                                                    ? 'rounded-tr-none bg-primary text-primary-foreground'
                                                                    : 'rounded-tl-none border border-border bg-background'
                                                                }`}
                                                        >
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                                {msg.message}
                                                            </p>
                                                        </div>
                                                        <span className="mt-1.5 px-1 text-[10px] font-medium text-muted-foreground opacity-60">
                                                            {formatTime(
                                                                msg.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="border-t border-border bg-background p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2"
                                >
                                    <Input
                                        value={msgData.message}
                                        onChange={(e) =>
                                            setMsgData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            selectedTicket.status ===
                                                'resolved' ||
                                                selectedTicket.status === 'closed'
                                                ? 'This ticket is resolved. Reply to reopen.'
                                                : 'Type your response...'
                                        }
                                        disabled={postingMsg}
                                        className="h-11 flex-1 border-border/60 focus:ring-primary/20"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={
                                            !msgData.message.trim() ||
                                            postingMsg
                                        }
                                        className="h-11 px-5 font-bold shadow-sm"
                                    >
                                        {postingMsg ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/30">
                                <Headset className="h-12 w-12 opacity-10" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                Select a support ticket
                            </h3>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed">
                                Choose a conversation from the sidebar to view
                                history or continue the chat.
                            </p>
                            {!isAdmin && (
                                <Button
                                    variant="outline"
                                    className="mt-8 border-primary/20 font-bold text-primary hover:bg-primary/5"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Support Ticket
                                </Button>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* Create Ticket Modal */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleCreateTicket}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Create Support Ticket
                            </DialogTitle>
                            <DialogDescription>
                                Describe your issue and our team will get back
                                to you shortly.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-6">
                            <div className="grid gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">
                                    Subject
                                </label>
                                <Input
                                    placeholder="What's the issue?"
                                    value={ticketData.subject}
                                    onChange={(e) =>
                                        setTicketData('subject', e.target.value)
                                    }
                                    required
                                    className="h-10 border-border/60"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">
                                        Category
                                    </label>
                                    <Select
                                        value={ticketData.category}
                                        onValueChange={(v) =>
                                            setTicketData('category', v)
                                        }
                                    >
                                        <SelectTrigger className="h-10 border-border/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">
                                                General Inquiry
                                            </SelectItem>
                                            <SelectItem value="Technical">
                                                Technical Issue
                                            </SelectItem>
                                            <SelectItem value="Billing">
                                                Billing & Finance
                                            </SelectItem>
                                            <SelectItem value="Access">
                                                Access / Permissions
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">
                                        Priority
                                    </label>
                                    <Select
                                        value={ticketData.priority}
                                        onValueChange={(v) =>
                                            setTicketData('priority', v as any)
                                        }
                                    >
                                        <SelectTrigger className="h-10 border-border/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="high">
                                                High
                                            </SelectItem>
                                            <SelectItem value="urgent">
                                                Urgent
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">
                                    Message
                                </label>
                                <textarea
                                    value={ticketData.message}
                                    onChange={(e) =>
                                        setTicketData('message', e.target.value)
                                    }
                                    className="flex min-h-[140px] w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe your issue in detail..."
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setCreateOpen(false)}
                                className="font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={creatingTicket}
                                className="px-8 font-bold shadow-md"
                            >
                                {creatingTicket ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Tickets.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Support & Helpdesk', href: '/support/tickets' },
    ],
};
