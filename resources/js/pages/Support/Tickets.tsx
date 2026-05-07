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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch { return ''; }
}

function formatTime(iso: string): string {
    if (!iso) return '';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

function initials(name: string): string {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Tickets({ tickets = [], isAdmin }: Props) {
    const { auth } = usePage().props as any;
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Forms
    const { data: msgData, setData: setMsgData, post: postMsg, processing: postingMsg, reset: resetMsg } = useForm({
        message: '',
    });

    const { data: ticketData, setData: setTicketData, post: postTicket, processing: creatingTicket, reset: resetTicket } = useForm({
        subject: '',
        category: 'General',
        priority: 'medium',
        message: '',
    });

    // ── Filter & Tabs ─────────────────────────────────────────────────────

    const filteredTickets = useMemo(() => {
        return (tickets || []).filter(t => {
            const matchesSearch = 
                (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
                t.id.toString().includes(search) ||
                (t.user?.name || '').toLowerCase().includes(search.toLowerCase());
            
            const isPast = t.status === 'resolved' || t.status === 'closed';
            const matchesTab = activeTab === 'active' ? !isPast : isPast;

            return matchesSearch && matchesTab;
        });
    }, [tickets, search, activeTab]);

    // When switching tabs or tickets list changes, select first if current not in view
    useEffect(() => {
        if (!selectedTicket && filteredTickets.length > 0) {
            setSelectedTicket(filteredTickets[0]);
        } else if (selectedTicket && !filteredTickets.find(t => t.id === selectedTicket.id)) {
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
            console.error("Failed to fetch messages", err);
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
            }
        });
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        postTicket('/support/tickets', {
            onSuccess: () => {
                setCreateOpen(false);
                resetTicket();
                setActiveTab('active');
            }
        });
    };

    const handleUpdateStatus = (status: string) => {
        if (!selectedTicket) return;
        router.patch(`/support/tickets/${selectedTicket.id}/status`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                const updated = { ...selectedTicket, status: status as any };
                setSelectedTicket(updated);
                router.reload({ only: ['tickets'] });
            }
        });
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-6 w-full flex flex-col h-[calc(100vh-4rem)] space-y-6">
            <Head title="Live Support & Tickets" />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <Headset className="h-8 w-8 mr-3 text-primary" />
                        Live Support & Helpdesk
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isAdmin ? 'Report Issues and Chat with Technical Team' : 'Get help from our technical team'}
                    </p>
                </div>
                {!isAdmin && (
                    <Button onClick={() => setCreateOpen(true)} className="shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                )}
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Tickets Sidebar */}
                <Card className="w-80 flex flex-col overflow-hidden border-border shadow-md">
                    <div className="p-4 border-b border-border bg-muted/20 space-y-3">
                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-muted rounded-lg w-full">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    activeTab === 'active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    activeTab === 'past' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                Past
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search tickets..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                        {filteredTickets.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground text-xs">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-10" />
                                No {activeTab} tickets found
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full text-left p-4 transition-all hover:bg-muted/30 ${selectedTicket?.id === ticket.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <Badge variant="outline" className="text-[10px] px-1.5 h-4 font-mono opacity-70">
                                            #{ticket.id}
                                        </Badge>
                                        <span className="text-[10px] font-medium text-muted-foreground">{timeAgo(ticket.created_at)}</span>
                                    </div>
                                    <div className="font-semibold text-sm mb-1 truncate text-foreground">{ticket.subject}</div>
                                    {isAdmin && <div className="text-[10px] text-muted-foreground mb-2 italic">User: {ticket.user?.name || 'Unknown'}</div>}
                                    
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            className={`text-[9px] px-1.5 py-0 border-0 uppercase font-bold ${
                                                ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {(ticket.status || 'open').replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-border uppercase font-medium ${
                                            ticket.priority === 'urgent' ? 'text-red-600 bg-red-50' :
                                            ticket.priority === 'high' ? 'text-orange-600 bg-orange-50' :
                                            'text-muted-foreground'
                                        }`}>
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-border shadow-md bg-background">
                    {selectedTicket ? (
                        <>
                            <div className="p-4 border-b border-border bg-muted/5 flex justify-between items-center shadow-sm z-10">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${
                                        selectedTicket.status === 'resolved' ? 'bg-emerald-100' : 'bg-primary/10'
                                    }`}>
                                        <MessageSquare className={`w-5 h-5 ${
                                            selectedTicket.status === 'resolved' ? 'text-emerald-600' : 'text-primary'
                                        }`} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg leading-none">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground font-medium">
                                            <span className="bg-muted px-1.5 py-0.5 rounded text-xs">#{selectedTicket.id}</span>
                                            <span>•</span>
                                            <span>Category: {selectedTicket.category}</span>
                                            <span>•</span>
                                            <span className={`uppercase ${
                                                selectedTicket.status === 'resolved' ? 'text-emerald-600' : 'text-primary'
                                            }`}>Status: {(selectedTicket.status || 'open').replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(isAdmin || selectedTicket.user_id === auth.user.id) && selectedTicket.status !== 'resolved' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleUpdateStatus('resolved')}
                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 font-bold text-xs"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                            Mark as Resolved
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/5"
                            >
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 text-center">
                                        <AlertCircle className="w-12 h-12 opacity-5" />
                                        <p className="text-sm font-medium opacity-40">No messages yet.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.user_id === auth.user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex max-w-[80%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className="flex-shrink-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                                                            isMe ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}>
                                                            {initials(msg.user?.name || 'Unknown')}
                                                        </div>
                                                    </div>
                                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        {!isMe && <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-1">{msg.user?.name || 'Unknown'}</span>}
                                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                                                            isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-background border border-border rounded-tl-none'
                                                        }`}>
                                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1.5 px-1 font-medium opacity-60">{formatTime(msg.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="p-4 bg-background border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input 
                                        value={msgData.message}
                                        onChange={(e) => setMsgData('message', e.target.value)}
                                        placeholder={selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? "This ticket is resolved. Reply to reopen." : "Type your response..."} 
                                        disabled={postingMsg}
                                        className="flex-1 h-11 border-border/60 focus:ring-primary/20"
                                    />
                                    <Button 
                                        type="submit" 
                                        disabled={!msgData.message.trim() || postingMsg}
                                        className="h-11 px-5 shadow-sm font-bold"
                                    >
                                        {postingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                <Headset className="w-12 h-12 opacity-10" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Select a support ticket</h3>
                            <p className="max-w-xs mt-2 text-sm leading-relaxed">
                                Choose a conversation from the sidebar to view history or continue the chat.
                            </p>
                            {!isAdmin && (
                                <Button variant="outline" className="mt-8 font-bold border-primary/20 text-primary hover:bg-primary/5" onClick={() => setCreateOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
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
                            <DialogTitle className="text-xl font-bold">Create Support Ticket</DialogTitle>
                            <DialogDescription>
                                Describe your issue and our team will get back to you shortly.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-5 py-6">
                            <div className="grid gap-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                                <Input 
                                    placeholder="What's the issue?"
                                    value={ticketData.subject}
                                    onChange={e => setTicketData('subject', e.target.value)}
                                    required
                                    className="h-10 border-border/60"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                                    <Select value={ticketData.category} onValueChange={v => setTicketData('category', v)}>
                                        <SelectTrigger className="h-10 border-border/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General Inquiry</SelectItem>
                                            <SelectItem value="Technical">Technical Issue</SelectItem>
                                            <SelectItem value="Billing">Billing & Finance</SelectItem>
                                            <SelectItem value="Access">Access / Permissions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                                    <Select value={ticketData.priority} onValueChange={v => setTicketData('priority', v as any)}>
                                        <SelectTrigger className="h-10 border-border/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Message</label>
                                <textarea
                                    value={ticketData.message}
                                    onChange={e => setTicketData('message', e.target.value)}
                                    className="flex min-h-[140px] w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe your issue in detail..."
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="font-bold">Cancel</Button>
                            <Button type="submit" disabled={creatingTicket} className="font-bold px-8 shadow-md">
                                {creatingTicket ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
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
