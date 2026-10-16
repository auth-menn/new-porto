import { ARCH_ASCII } from '@/data/arch-ascii';

type ArchLogoProps = {
    className?: string;
};

export function ArchLogo({ className }: ArchLogoProps) {
    return (
        <pre
            aria-hidden="true"
            className={className}
            style={{ userSelect: 'none' }}
        >
            {ARCH_ASCII.join('\n')}
        </pre>
    );
}
