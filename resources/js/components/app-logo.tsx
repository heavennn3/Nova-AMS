/**
 * Full Nova AMS logo — used in the sidebar header (expanded state).
 * Shows the logo text at a comfortable height that fits the sidebar.
 */
export default function AppLogo() {
    return (
        <div className="flex items-center h-8">
            <span className="text-xl font-bold tracking-tight">
                <span className="text-primary">NOVA</span>{' '}
                <span className="text-muted-foreground">AMS</span>
            </span>
        </div>
    );
}
