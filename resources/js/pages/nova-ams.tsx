import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Package,
    Wrench,
    Shield,
    ShieldCheck,
    Map,
    Activity,
    Clock,
    CheckCircle2,
    ChevronRight,
    LayoutGrid,
    Terminal,
    ArrowRight,
    Table,
    Users,
    Briefcase,
    Globe,
    FileText,
    TrendingUp,
    Server,
    HeartPulse,
    Lock,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Nova Asset Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#1b1b18] antialiased transition-colors duration-300 dark:bg-[#09090b] dark:text-[#EDEDEC]">
                {/* Header Navbar */}
                <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[#FAFAFA]/90 px-6 py-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#09090b]/90">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                <Package className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                NOVA{' '}
                                <span className="font-medium text-zinc-500">
                                    AMS
                                </span>
                            </span>
                        </div>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                                        >
                                            Register Account
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-24 px-6 py-12 lg:py-20">
                    {/* Hero Section */}
                    <section className="mx-auto max-w-3xl space-y-6 text-center">


                        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
                            NOVA
                            Asset Management System
                        </h1>

                        <p className="text-lg leading-relaxed font-normal text-zinc-600 dark:text-zinc-400">
                            Nova AMS delivers robust hardware lifecycle logging,
                            preventive maintenance dispatching, physical
                            coordinate mapping, and vendor SLA control.
                            Engineered for teams requiring absolute speed and
                            data fidelity.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                                >
                                    Access System Control
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                                    >
                                        Log in to Platform
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/80"
                                    >
                                        Request Access
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Interactive CSS Dashboard Mockup (Visual Evidence) */}
                    <section className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex items-center space-x-2">
                                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                                <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                                <span className="h-3 w-3 rounded-full bg-green-400"></span>
                                <span className="pl-4 text-xs font-semibold tracking-wider text-zinc-500">
                                    NOVA-AMS-CONTROL-PANEL v3.4
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    All Systems Online
                                </span>
                            </div>
                        </div>

                        <div className="grid h-[480px] grid-cols-1 lg:grid-cols-[240px_1fr]">
                            {/* Mock Sidebar */}
                            <div className="hidden flex-col space-y-6 border-r border-zinc-200 bg-zinc-50/50 p-4 lg:flex dark:border-zinc-800 dark:bg-zinc-950/20">
                                <div className="space-y-1.5">
                                    <p className="px-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                        Main Menu
                                    </p>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-900 dark:bg-zinc-900 dark:text-white">
                                            <LayoutGrid className="h-4 w-4 text-zinc-500" />
                                            <span>Overview Dashboard</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                            <Package className="h-4 w-4" />
                                            <span>Asset Register</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                            <Map className="h-4 w-4" />
                                            <span>Geographic Maps</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="px-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                                        Operations
                                    </p>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                            <Wrench className="h-4 w-4" />
                                            <span>Work Orders</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                            <Briefcase className="h-4 w-4" />
                                            <span>Vendor Performance</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>SLA Compliance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Workspace Content */}
                            <div className="space-y-6 overflow-y-auto bg-[#FDFDFC] p-6 dark:bg-[#0c0c0e]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                            Operations Control
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Live feed and hardware metric
                                            tracking.
                                        </p>
                                    </div>
                                    <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-1 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-950">
                                        POLL_INTERVAL: 5000ms
                                    </span>
                                </div>

                                {/* Mock Stats cards */}
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Active Hardware
                                        </p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            12,840
                                        </p>
                                        <span className="flex items-center text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            <TrendingUp className="mr-0.5 h-3 w-3" />{' '}
                                            +4.2% MoM
                                        </span>
                                    </div>
                                    <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Preventive SLAs
                                        </p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            98.9%
                                        </p>
                                        <span className="flex items-center text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="mr-0.5 h-3 w-3" />{' '}
                                            Normal Bounds
                                        </span>
                                    </div>
                                    <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Open Work Orders
                                        </p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            14
                                        </p>
                                        <span className="flex items-center text-[9px] font-semibold text-zinc-500">
                                            <Clock className="mr-0.5 h-3 w-3" />{' '}
                                            8 In Progress
                                        </span>
                                    </div>
                                    <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Active Coordinates
                                        </p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            24 Sites
                                        </p>
                                        <span className="flex items-center text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Globe className="mr-0.5 h-3 w-3" />{' '}
                                            Mapping Active
                                        </span>
                                    </div>
                                </div>

                                {/* Mock visual graph layout */}
                                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                                            Monthly Incident Resolution Velocity
                                        </h3>
                                        <span className="text-[10px] font-medium text-zinc-500">
                                            Resolution time (m) / Volume
                                        </span>
                                    </div>
                                    {/* Pure CSS SVG Elegant Line Chart */}
                                    <div className="flex h-[120px] w-full items-end">
                                        <svg
                                            className="h-full w-full"
                                            viewBox="0 0 600 100"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="chartGrad"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#18181b"
                                                        stopOpacity="0.12"
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#18181b"
                                                        stopOpacity="0.00"
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="chartGradDark"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#ffffff"
                                                        stopOpacity="0.08"
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#ffffff"
                                                        stopOpacity="0.00"
                                                    />
                                                </linearGradient>
                                            </defs>

                                            {/* Grid Lines */}
                                            <line
                                                x1="0"
                                                y1="25"
                                                x2="600"
                                                y2="25"
                                                stroke="#888"
                                                strokeWidth="0.5"
                                                strokeDasharray="3 3"
                                                opacity="0.15"
                                            />
                                            <line
                                                x1="0"
                                                y1="50"
                                                x2="600"
                                                y2="50"
                                                stroke="#888"
                                                strokeWidth="0.5"
                                                strokeDasharray="3 3"
                                                opacity="0.15"
                                            />
                                            <line
                                                x1="0"
                                                y1="75"
                                                x2="600"
                                                y2="75"
                                                stroke="#888"
                                                strokeWidth="0.5"
                                                strokeDasharray="3 3"
                                                opacity="0.15"
                                            />

                                            {/* Gradient Fill */}
                                            <path
                                                d="M0,90 L60,82 L120,88 L180,68 L240,75 L300,52 L360,59 L420,38 L480,45 L540,22 L600,28 L600,100 L0,100 Z"
                                                className="fill-[url(#chartGrad)] dark:fill-[url(#chartGradDark)]"
                                            />

                                            {/* Line */}
                                            <path
                                                d="M0,90 L60,82 L120,88 L180,68 L240,75 L300,52 L360,59 L420,38 L480,45 L540,22 L600,28"
                                                fill="none"
                                                className="stroke-zinc-800 dark:stroke-zinc-200"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />

                                            {/* Dots */}
                                            <circle
                                                cx="300"
                                                cy="52"
                                                r="3.5"
                                                className="fill-zinc-950 stroke-zinc-200 dark:fill-white dark:stroke-zinc-800"
                                                strokeWidth="1.5"
                                            />
                                            <circle
                                                cx="540"
                                                cy="22"
                                                r="3.5"
                                                className="fill-zinc-950 stroke-zinc-200 dark:fill-white dark:stroke-zinc-800"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-2 flex justify-between font-mono text-[9px] text-zinc-400">
                                        <span>JAN</span>
                                        <span>MAR</span>
                                        <span>MAY</span>
                                        <span>JUL</span>
                                        <span>SEP</span>
                                        <span>NOV</span>
                                    </div>
                                </div>

                                {/* Mock Audit Logs */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                                            Live Audit Trail
                                        </p>
                                        <span className="text-[9px] text-zinc-400">
                                            Stream connected
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[10px] leading-normal text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                                        <div className="flex items-start gap-1">
                                            <span className="text-zinc-400 select-none">
                                                [10:42:15]
                                            </span>
                                            <span>
                                                Server Blade checkout: Rack B-12
                                                assigned to Site A-West
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1">
                                            <span className="text-zinc-400 select-none">
                                                [09:30:00]
                                            </span>
                                            <span>
                                                Preventive check: HVAC-04
                                                compressor validation{' '}
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    SLA Compliant
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1">
                                            <span className="text-zinc-400 select-none">
                                                [08:15:22]
                                            </span>
                                            <span>
                                                SLA Expiration alerts dispatched
                                                to Vendor: CISCO Systems Ltd.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Core Features Grid */}
                    <section className="space-y-8">
                        <div className="space-y-2 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Architectural Core Capabilities
                            </h2>
                            <p className="mx-auto max-w-xl text-sm text-zinc-500">
                                Standardized modules built to govern high-volume
                                industrial assets and maintenance operations
                                with full transaction isolation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                                    <Package className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Asset Custody & Logbook
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Maintains a serialized inventory of physical
                                    assets, complete with allocation workflows,
                                    checkout history, and spare parts tracking.
                                    Keep a precise paper trail of active user
                                    responsibility.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Operations & Maintenance Scheduling
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Plan routines, auto-dispatch technician
                                    assignments, log repair operations, and
                                    control incident work order cycles. Ensure
                                    minor faults are mitigated before causing
                                    core system downtime.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                                    <Map className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Geographic Mapping & Spatial Coordination
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Maps coordinate positions and visualizes
                                    custom facility floor plans. Easily assign
                                    physical location nodes to each piece of
                                    hardware, eliminating coordinate confusion
                                    in physical deployments.
                                </p>
                            </div>

                            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Vendor Performance & SLA Intelligence
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    Monitor vendor KPIs, track procurement
                                    purchase orders, assign service level
                                    agreements, and generate automated contract
                                    expiration alerts. Avoid costly renewals and
                                    compliance gaps.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Zero Slop Banner */}
                    <section className="flex flex-col items-start justify-between gap-6 rounded-xl border border-zinc-200 bg-zinc-50 p-8 md:flex-row md:items-center dark:border-zinc-800 dark:bg-zinc-900/30">
                        <div className="max-w-2xl space-y-2">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-800 uppercase dark:bg-zinc-800 dark:text-zinc-300">
                                Platform Core Philosophy
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Engineered for Operations, Not Buzzwords
                            </h3>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Nova AMS is optimized for raw speed, high
                                transactional throughput, and clean keyboard
                                layouts. We do not integrate flashy floating orb
                                graphics, fake AI chatbot widgets, or confusing
                                marketing fluff. Just highly reliable,
                                deterministic database services and operations.
                            </p>
                        </div>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                            <Terminal className="h-5 w-5" />
                        </div>
                    </section>

                    {/* Live System Status Showcase */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Real-Time Platform Benchmarks
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Continuous telemetry metrics gathered
                                    directly from our services.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <HeartPulse className="h-4 w-4" /> Live Uptime
                                Status
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="flex items-center space-x-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950">
                                    <Server className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-zinc-400">
                                        Asset Indexer
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        99.99% Uptime{' '}
                                        <span className="font-mono text-[10px] text-zinc-500">
                                            (0.8ms query)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950">
                                    <Lock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-zinc-400">
                                        Auth & Encryption Engine
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        FIPS Compliant{' '}
                                        <span className="font-mono text-[10px] text-zinc-500">
                                            (256-bit GCM)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-950">
                                    <Table className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-zinc-400">
                                        Backup Integrity
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        Hourly Checksums{' '}
                                        <span className="font-mono text-[10px] text-zinc-500">
                                            (100% verified)
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-zinc-200 bg-zinc-50 px-6 py-12 dark:border-zinc-800 dark:bg-zinc-950/20">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-zinc-500 md:flex-row">
                        <div className="flex items-center space-x-2.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                                <Package className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                                NOVA{' '}
                                <span className="font-medium text-zinc-500">
                                    AMS
                                </span>
                            </span>
                        </div>
                        <p>
                            © 2026 Novatis Resources. All rights reserved.
                            Secure Infrastructure System.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

Welcome.layout = {
    breadcrumbs: [
        {
            title: 'Welcome',
            href: '#',
        },
    ],
};
