interface Props {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Compact Nova logo — used wherever a small square icon is needed
 * (sidebar header when collapsed, mobile sheet, auth pages, etc.)
 */
export default function AppLogoIcon({ className, style }: Props) {
    return (
        <div 
            className={`flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground font-bold text-sm ${className || ''}`}
            style={style}
        >
            NOVA
        </div>
    );
}
