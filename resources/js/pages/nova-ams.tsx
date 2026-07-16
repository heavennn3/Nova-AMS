import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, CheckCircle2, ClipboardList, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<any>().props;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Nova Asset Management System" />

            <header className="border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">

                        <div>
                            <p className="text-sm font-semibold leading-none">Nova AMS</p>
                            <p className="text-xs text-muted-foreground">Asset Management System</p>
                        </div>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link href={dashboard()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                                Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link href={register()} className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
                <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Built for Novatis operations
                        </div>

                        <div className="space-y-4">
                            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                                Manage assets, loans, spare parts, and licenses in one system.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Nova AMS keeps inventory records clean, tracks asset movement, and gives teams a clear view of what is owned, used, overdue, or low in stock.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href={auth.user ? dashboard() : login()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
                                {auth.user ? 'Open Dashboard' : 'Log in to Nova AMS'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            {canRegister && !auth.user && (
                                <Link href={register()} className="inline-flex h-11 items-center rounded-lg border bg-card px-5 text-sm font-medium shadow-sm transition hover:bg-muted">
                                    Register
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between border-b pb-4">
                            <div>
                                <p className="text-sm font-semibold">Nova AMS </p>

                            </div>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Active</span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Metric label="Assets tracked" value="Inventory" icon={Boxes} />
                            <Metric label="Borrowed items" value="Loans" icon={ClipboardList} />
                            <Metric label="Site records" value="Locations" icon={MapPin} />
                            <Metric label="Maintenance" value="Sparepart" icon={Wrench} />
                        </div>
                    </div>
                </section>

                <section className="mt-16 grid gap-4 md:grid-cols-3">
                    <Feature icon={Boxes} title="Asset inventory" text="Keep asset details, categories, status, and site ownership easy to find." />
                    <Feature icon={ClipboardList} title="Loans and returns" text="Track who is using each item, expected return dates, and overdue records." />
                    <Feature icon={ShieldCheck} title="Spare parts and licenses" text="Monitor site spare parts, software licenses, and operational availability." />
                </section>
            </main>

            <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
                © 2026 Nova Asset Management System.
            </footer>
        </div>
    );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <Icon className="mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <Icon className="mb-4 h-5 w-5 text-primary" />
            <h2 className="mb-2 text-base font-semibold">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
    );
}
