import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { HomeFrame } from '@/components/home-frame';
import { SiteHeader } from '@/components/site-header';
import { useAppearance } from '@/hooks/use-appearance';

export default function Home() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [themeTransitionsReady, setThemeTransitionsReady] = useState(false);
    const isDark = resolvedAppearance === 'dark';

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setThemeTransitionsReady(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <>
            <Head title="Firman Maulana Syabani | IT Developer" />
            <SiteHeader
                isDark={isDark}
                onAppearanceToggle={() =>
                    updateAppearance(isDark ? 'light' : 'dark')
                }
                themeTransitionsReady={themeTransitionsReady}
            />
            <HomeFrame themeTransitionsReady={themeTransitionsReady} />
        </>
    );
}
