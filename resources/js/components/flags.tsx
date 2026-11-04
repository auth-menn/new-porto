type FlagProps = {
    className?: string;
};

export function FlagID({ className }: FlagProps) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="20"
            height="14"
            viewBox="0 0 20 14"
            shapeRendering="geometricPrecision"
            className={className}
        >
            <rect width="20" height="7" fill="#CE1126" />
            <rect y="7" width="20" height="7" fill="#FFFFFF" />
        </svg>
    );
}

export function FlagGB({ className }: FlagProps) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="20"
            height="14"
            viewBox="0 0 20 14"
            shapeRendering="geometricPrecision"
            className={className}
        >
            <rect width="20" height="14" fill="#012169" />
            <path d="M0 0 20 14M20 0 0 14" stroke="#FFFFFF" strokeWidth="3.4" />
            <path d="M0 0 20 14M20 0 0 14" stroke="#C8102E" strokeWidth="1.4" />
            <path d="M10 0v14M0 7h20" stroke="#FFFFFF" strokeWidth="5" />
            <path d="M10 0v14M0 7h20" stroke="#C8102E" strokeWidth="2.6" />
        </svg>
    );
}

export function FlagJP({ className }: FlagProps) {
    return (
        <svg aria-hidden="true" focusable="false" width="20" height="14" viewBox="0 0 20 14" className={className}>
            <rect width="20" height="14" fill="#fff" />
            <circle cx="10" cy="7" r="4" fill="#bc002d" />
        </svg>
    );
}

export function FlagCN({ className }: FlagProps) {
    return (
        <svg aria-hidden="true" focusable="false" width="20" height="14" viewBox="0 0 20 14" className={className}>
            <rect width="20" height="14" fill="#de2910" />
            <path d="m4 2 .55 1.15 1.27.18-.91.89.22 1.26L4 4.89l-1.13.59.22-1.26-.91-.89 1.27-.18L4 2Z" fill="#ffde00" />
            <circle cx="7.2" cy="2.6" r=".65" fill="#ffde00" />
            <circle cx="8.1" cy="4.1" r=".65" fill="#ffde00" />
            <circle cx="8.05" cy="5.9" r=".65" fill="#ffde00" />
            <circle cx="7" cy="7.1" r=".65" fill="#ffde00" />
        </svg>
    );
}

export function FlagRU({ className }: FlagProps) {
    return (
        <svg aria-hidden="true" focusable="false" width="20" height="14" viewBox="0 0 20 14" className={className}>
            <rect width="20" height="14" fill="#fff" />
            <rect y="4.67" width="20" height="4.66" fill="#0039a6" />
            <rect y="9.33" width="20" height="4.67" fill="#d52b1e" />
        </svg>
    );
}

export function FlagAR({ className }: FlagProps) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="20"
            height="14"
            viewBox="0 0 20 14"
            className={className}
        >
            <rect width="20" height="14" rx="2" fill="#166534" />
            <text
                x="10"
                y="10.5"
                fill="#fff"
                fontFamily="Arial, sans-serif"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
            >
                ع
            </text>
        </svg>
    );
}
