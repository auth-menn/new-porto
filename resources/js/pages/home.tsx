import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { HomeFrame } from '@/components/home-frame';
import { SiteHeader } from '@/components/site-header';
import { useAppearance } from '@/hooks/use-appearance';
import { useLang } from '@/lib/i18n';
import {
    playVenomTransition,
    warmUpVenomTransition,
} from '@/lib/venom-transition';
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
    const { t } = useLang();
    const [themeTransitionsReady, setThemeTransitionsReady] = useState(false);
    const isDark = resolvedAppearance === 'dark';
        
    const toggleAppearance = () => {
        const next = isDark ? 'light' : 'dark';
        const button = document.querySelector<HTMLElement>('#theme-toggle');

        if (!button) {
            updateAppearance(next);
            return;
        }

        // Hero di posisi atas -> venom terpisah di dalam dan di luar panel.
        const panel = document.querySelector<HTMLElement>('[data-home-panel]');
        const frame = document.querySelector<HTMLElement>('.home-frame');
        const usePanelScope = panel !== null && frame !== null && window.scrollY < 80;

        void playVenomTransition(
            button,
            () => updateAppearance(next),
            {
                // warna = tema LAMA (venom hitam menutup saat dark, lalu surut)
                color: '#000000',
                mode: isDark ? 'retreat' : 'cover',
                container: usePanelScope ? panel : null,
                outsideContainer: usePanelScope ? frame : null,
                outsideColor: '#ffffff',
                coverMs: usePanelScope ? 3800 : 3000,
                retreatMs: usePanelScope ? 3800 : 3000,
                fadeOutMs: 700,
            },
        );
    };

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setThemeTransitionsReady(true);
            warmUpVenomTransition();
        });

        // setelah tema final, paksa semua logika berbasis scroll menghitung ulang
        const onSettled = () => {
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('scroll'));
            // jika memakai GSAP: ScrollTrigger.refresh();
        };
        window.addEventListener('venom-settled', onSettled);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('venom-settled', onSettled);
        };
    }, []);

    return (
        <>
            <Head title={t('seoTitle')}>
                <meta head-key="description" name="description" content={t('seoDescription')} />
                <link head-key="canonical" rel="canonical" href={seo.canonicalUrl} />
                <meta head-key="og:title" property="og:title" content={t('seoTitle')} />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={t('seoDescription')}
                />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="og:url" property="og:url" content={seo.canonicalUrl} />
                <meta head-key="og:image" property="og:image" content={seo.socialImageUrl} />
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content={t('seoImageAlt')}
                />
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:title" name="twitter:title" content={t('seoTitle')} />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={t('seoDescription')}
                />
                <meta head-key="twitter:image" name="twitter:image" content={seo.socialImageUrl} />
                <meta
                    head-key="twitter:image:alt"
                    name="twitter:image:alt"
                    content={t('seoImageAlt')}
                />
            </Head>
            <SiteHeader
                isDark={isDark}
                menuImages={menuImages}
                onAppearanceToggle={toggleAppearance}
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
