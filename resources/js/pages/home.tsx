import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { HomeFrame } from '@/components/home-frame';
import { SiteHeader } from '@/components/site-header';
import { useAppearance } from '@/hooks/use-appearance';
import type { Journey, MenuImages, Project } from '@/types';

export default function Home({ projects, journeys, menuImages }: { projects: Project[]; journeys: Journey[]; menuImages: MenuImages }) {
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
                menuImages={menuImages}
                onAppearanceToggle={() =>
                    updateAppearance(isDark ? 'light' : 'dark')
                }
                themeTransitionsReady={themeTransitionsReady}
            />
            <HomeFrame projects={projects} journeys={journeys} themeTransitionsReady={themeTransitionsReady} />
        </>
    );
}
