import { useState } from 'react';
import { Link } from '@inertiajs/react';

type SiteLogoProps = {
    language: 'id' | 'en';
};

export function SiteLogo({ language }: SiteLogoProps) {
    const [logoAvailable, setLogoAvailable] = useState(true);

    return (
        <Link
            href="/"
            aria-label={
                language === 'id'
                    ? 'Firman Maulana Syabani, beranda'
                    : 'Firman Maulana Syabani, home'
            }
            className="flex h-full min-h-11 min-w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-current"
        >
            {logoAvailable ? (
                <img
                    src="/images/logo.webp"
                    alt="Firman Maulana Syabani"
                    width={460}
                    height={460}
                    loading="eager"
                    draggable={false}
                    onError={() => setLogoAvailable(false)}
                    className="h-[clamp(40px,2.7vw,56px)] w-auto object-contain max-[767px]:h-10"
                />
            ) : (
                <span className="font-michroma text-[clamp(12px,1.5vw,22px)] text-current">
                    FMS
                </span>
            )}
        </Link>
    );
}
