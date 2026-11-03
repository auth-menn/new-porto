import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { HomeFrame } from '@/components/home-frame';
import { SiteHeader } from '@/components/site-header';
import { useAppearance } from '@/hooks/use-appearance';
import type { Journey, MenuImages, Project } from '@/types';

type HomeSeo = {
    title: string;
    description: string;
    canonicalUrl: string;
    socialImageUrl: string;
};

export default function Home({
    projects,
    journeys,
    menuImages,
    seo,
}: {
    projects: Project[];
    journeys: Journey[];
    menuImages: MenuImages;
    seo: HomeSeo;
}) {
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
            <Head title={seo.title}>
                <meta head-key="description" name="description" content={seo.description} />
                <link head-key="canonical" rel="canonical" href={seo.canonicalUrl} />
                <meta head-key="og:title" property="og:title" content={seo.title} />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={seo.description}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={seo.canonicalUrl} />
                <meta head-key="og:image" property="og:image" content={seo.socialImageUrl} />
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content="Logo portofolio Firman Maulana Syabani"
                />
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:title" name="twitter:title" content={seo.title} />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={seo.description}
                />
                <meta head-key="twitter:image" name="twitter:image" content={seo.socialImageUrl} />
                <meta
                    head-key="twitter:image:alt"
                    name="twitter:image:alt"
                    content="Logo portofolio Firman Maulana Syabani"
                />
            </Head>
            <SiteHeader
                isDark={isDark}
                menuImages={menuImages}
                onAppearanceToggle={() => updateAppearance(isDark ? 'light' : 'dark')}
                themeTransitionsReady={themeTransitionsReady}
            />
            <HomeFrame
                projects={projects}
                journeys={journeys}
                themeTransitionsReady={themeTransitionsReady}
            />
        </>
    );
}
