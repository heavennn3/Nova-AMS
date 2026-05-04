interface Props {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Compact Novatis logo — used wherever a small square icon is needed
 * (sidebar header, mobile sheet, auth pages, etc.)
 */
export default function AppLogoIcon({ className, style }: Props) {
    return (
        <img
            src="/images/novatis-logo.png"
            alt="Novatis Resources"
            className={className}
            style={{ objectFit: 'contain', ...style }}
        />
    );
}
