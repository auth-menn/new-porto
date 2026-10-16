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
