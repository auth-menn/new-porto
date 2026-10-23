import {
    lazy,
    Suspense,
    type CSSProperties,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { router } from '@inertiajs/react';
import { ArrowDown, Database } from 'lucide-react';
import { ProjectSummary } from '@/components/project-summary';
import { ProjectShowcase } from '@/components/project-showcase';
import { JourneyShowcase } from '@/components/journey-showcase';
import { ContactShowcase } from '@/components/contact-showcase';
import { ABOUT_CONTENT } from '@/data/about';
import { ABOUT_CONFIG } from '@/data/about-config';
import { setScrollActiveSection } from '@/hooks/use-active-section';
import { useLang } from '@/lib/i18n';
import { goToSection } from '@/lib/scroll-nav';

const LazyTerminal = lazy(() => import('@/components/terminal'));

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

type HomeFrameProps = {
    themeTransitionsReady: boolean;
};

type FrameShape = {
    path: string;
};

const homeContent = {
    photoAlt: 'Firman Maulana Syabani, IT Developer',
    marqueeItems: [
        {
            name: 'HTML',
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
            mode: 'image',
        },
        {
            name: 'CSS',
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
            mode: 'image',
        },
        { name: 'PHP', icon: 'php', color: '777BB4', mode: 'brand' },
        {
            name: 'JAVASCRIPT',
            icon: 'javascript',
            color: 'F7DF1E',
            mode: 'brand',
        },
        { name: 'REACT', icon: 'react', color: '61DAFB', mode: 'brand' },
        {
            name: 'TYPESCRIPT',
            icon: 'typescript',
            color: '3178C6',
            mode: 'brand',
        },
        {
            name: 'NEXT.JS',
            icon: 'nextdotjs',
            color: '000000',
            mode: 'current',
        },
        {
            name: 'PYTHON',
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
            mode: 'image',
        },
        { name: 'LARAVEL', icon: 'laravel', color: 'FF2D20', mode: 'brand' },
        {
            name: 'BOOTSTRAP',
            icon: 'bootstrap',
            color: '7952B3',
            mode: 'brand',
        },
        {
            name: 'TAILWIND CSS',
            icon: 'tailwindcss',
            color: '06B6D4',
            mode: 'brand',
        },
        { name: 'SQL', icon: null, mode: 'current' },
        { name: 'GITHUB', icon: 'github', color: '000000', mode: 'current' },
        { name: 'FIGMA', icon: 'figma', color: 'F24E1E', mode: 'brand' },
        { name: 'POSTMAN', icon: 'postman', color: 'FF6C37', mode: 'brand' },
        {
            name: 'VISUAL STUDIO CODE',
            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg',
            mode: 'image',
        },
    ],
} as const;
const MARQUEE_SPEED_PX_PER_SECOND = 35;

async function decodeImage(image: HTMLImageElement): Promise<void> {
    if (!image.complete) {
        await new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
        });
    }

    if (image.naturalWidth > 0) {
        await image.decode().catch(() => undefined);
    }
}

function buildFramePath(width: number, height: number): FrameShape {
    const isMobile = width < 768;
    const insetX = width * (isMobile ? 0.03 : 0.042);
    const topSide = Math.max(64, height * 0.075);
    const bottomSide = isMobile ? height - 44 : height * 0.947;
    const bottomCenter = height * 0.98;
    const radius = Math.min(48, Math.max(16, width * 0.025));
    const archStart = width * (isMobile ? 0.34 : 0.385);
    const archFlatStart = width * (isMobile ? 0.38 : 0.425);
    const archFlatEnd = width * (isMobile ? 0.62 : 0.575);
    const archEnd = width * (isMobile ? 0.66 : 0.615);
    const archTop = isMobile ? topSide - 52 : Math.max(6, height * 0.01);

    const path = [
        `M ${insetX + radius} ${topSide}`,
        `L ${archStart} ${topSide}`,
        `C ${width * (isMobile ? 0.36 : 0.405)} ${topSide} ${width * (isMobile ? 0.36 : 0.405)} ${archTop} ${archFlatStart} ${archTop}`,
        `L ${archFlatEnd} ${archTop}`,
        `C ${width * (isMobile ? 0.64 : 0.595)} ${archTop} ${width * (isMobile ? 0.64 : 0.595)} ${topSide} ${archEnd} ${topSide}`,
        `L ${width - insetX - radius} ${topSide}`,
        `Q ${width - insetX} ${topSide} ${width - insetX} ${topSide + radius}`,
        `L ${width - insetX} ${bottomSide - radius}`,
        `Q ${width - insetX} ${bottomSide} ${width - insetX - radius} ${bottomSide}`,
        `L ${width * 0.81} ${bottomSide}`,
        `C ${width * 0.79} ${bottomSide} ${width * 0.785} ${bottomCenter} ${width * 0.76} ${bottomCenter}`,
        `L ${width * 0.24} ${bottomCenter}`,
        `C ${width * 0.215} ${bottomCenter} ${width * 0.21} ${bottomSide} ${width * 0.19} ${bottomSide}`,
        `L ${insetX + radius} ${bottomSide}`,
        `Q ${insetX} ${bottomSide} ${insetX} ${bottomSide - radius}`,
        `L ${insetX} ${topSide + radius}`,
        `Q ${insetX} ${topSide} ${insetX + radius} ${topSide}`,
        'Z',
    ].join(' ');

    return { path };
}

function MenuMarquee() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [trackWidth, setTrackWidth] = useState(0);

    useEffect(() => {
        const marqueeElement = marqueeRef.current;
        const trackElement = trackRef.current;

        if (!marqueeElement || !trackElement) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        });
        observer.observe(marqueeElement);

        const resizeObserver = new ResizeObserver(([entry]) => {
            setTrackWidth(entry.contentRect.width);
        });
        resizeObserver.observe(trackElement);

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div
            ref={marqueeRef}
            aria-hidden="true"
            className="absolute right-0 bottom-[5.3%] left-0 z-[1] h-[max(40px,5%)] overflow-hidden font-michroma text-[clamp(9px,0.9vw,16px)] whitespace-nowrap max-[767px]:bottom-[44px]"
        >
            <div
                ref={trackRef}
                className={`home-marquee-track flex h-full w-max items-center ${isVisible ? '' : '[animation-play-state:paused]'}`}
                style={{
                    animationDuration: trackWidth
                        ? `${(trackWidth / 2 / MARQUEE_SPEED_PX_PER_SECOND) * 1000}ms`
                        : undefined,
                }}
            >
                {Array.from({ length: 12 }, (_, copyIndex) => (
                    <span
                        key={copyIndex}
                        aria-hidden={copyIndex > 0 || undefined}
                        className="inline-flex items-center"
                    >
                        {homeContent.marqueeItems.map((item) => (
                            <span
                                key={item.name}
                                className="inline-flex items-center px-[1.5em]"
                            >
                                {item.icon ? (
                                    item.mode === 'current' ? (
                                        <span
                                            aria-hidden="true"
                                            className="tech-icon-current size-9 shrink-0"
                                            style={{
                                                maskImage: `url(https://cdn.simpleicons.org/${item.icon}/${item.color})`,
                                                WebkitMaskImage: `url(https://cdn.simpleicons.org/${item.icon}/${item.color})`,
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={
                                                item.mode === 'image'
                                                    ? item.icon
                                                    : `https://cdn.simpleicons.org/${item.icon}/${item.color}`
                                            }
                                            alt=""
                                            aria-hidden="true"
                                            width="36"
                                            height="36"
                                            loading="lazy"
                                            className="size-9 shrink-0 object-contain"
                                        />
                                    )
                                ) : (
                                    <Database
                                        aria-hidden="true"
                                        className="size-9 shrink-0"
                                    />
                                )}
                            </span>
                        ))}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function HomeFrame({ themeTransitionsReady }: HomeFrameProps) {
    const frameRef = useRef<HTMLElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const [frameShape, setFrameShape] = useState<FrameShape | null>(null);
    const [lightImageAvailable, setLightImageAvailable] = useState(true);
    const [darkImageAvailable, setDarkImageAvailable] = useState(true);
    const [heroReady, setHeroReady] = useState(false);
    const [heroEntered, setHeroEntered] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);
    const [scrollDismissed, setScrollDismissed] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [terminalActive, setTerminalActive] = useState(false);
    const [terminalChunkReady, setTerminalChunkReady] = useState(false);
    const [terminalReady, setTerminalReady] = useState(false);
    const [directAboutVisit, setDirectAboutVisit] = useState(false);
    const initialAboutHashRef = useRef(
        typeof window !== 'undefined' && window.location.hash === '#tentang',
    );
    const initialProjectsHashRef = useRef(
        typeof window !== 'undefined' && window.location.hash === '#proyek',
    );
    const markTerminalReady = useCallback(() => setTerminalReady(true), []);
    const { language, t } = useLang();
    const aboutSummary = ABOUT_CONTENT.about[language].join(' ');
    const transitionReady = themeTransitionsReady ? '' : 'transition-none';
    const markHeroEntered = useCallback(() => setHeroEntered(true), []);

    useLayoutEffect(() => {
        const previousRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        let initialVisitPending = true;
        let userInteracted = false;
        let projectJumpFrame = 0;
        let aboutJumpFrame = 0;

        const jumpToAbout = () => {
            window.cancelAnimationFrame(aboutJumpFrame);
            let attempts = 0;
            const placeAtAbout = () => {
                let trigger = ScrollTrigger.getById('about-scene');
                const scene = sceneRef.current;

                if (!trigger && attempts < 120) {
                    attempts += 1;
                    aboutJumpFrame =
                        window.requestAnimationFrame(placeAtAbout);
                    return;
                }

                ScrollTrigger.refresh();
                trigger = ScrollTrigger.getById('about-scene');

                const top = trigger
                    ? trigger.start +
                      (trigger.end - trigger.start) * ABOUT_CONFIG.restAt
                    : scene
                      ? scene.offsetTop +
                        Math.max(0, scene.scrollHeight - window.innerHeight) *
                            ABOUT_CONFIG.restAt
                      : 0;

                window.scrollTo({ top, behavior: 'instant' });
                ScrollTrigger.update(true);
                trigger?.animation?.progress(ABOUT_CONFIG.restAt);

                const aboutLayer = scene?.querySelector<HTMLElement>(
                    '[data-about-layer]',
                );
                const terminalPosition = terminalRef.current;
                const terminalBody = terminalPosition?.querySelector<HTMLElement>(
                    '.terminal-window',
                );
                const terminalContent = terminalBody
                    ? (Array.from(terminalBody.children) as HTMLElement[]).filter(
                          (child) =>
                              !child.matches('[data-terminal-arch-background]'),
                      )
                    : [];

                if (aboutLayer) {
                    gsap.set(aboutLayer, { autoAlpha: 1 });
                    aboutLayer.style.pointerEvents = 'auto';
                }
                if (terminalPosition) {
                    gsap.set(terminalPosition, { x: 0, opacity: 1 });
                }
                if (terminalBody) {
                    gsap.set(terminalBody, { clipPath: 'none' });
                    gsap.set(terminalContent, { opacity: 1 });
                }
                const terminalRoot = terminalPosition?.querySelector<HTMLElement>(
                    '.about-terminal',
                );
                if (terminalRoot) terminalRoot.inert = false;
                setTerminalActive(true);
                setHeroEntered(true);
            };

            aboutJumpFrame = window.requestAnimationFrame(placeAtAbout);
        };

        const jumpToProjects = () => {
            let attempts = 0;
            const placeAtProjects = () => {
                const trigger = ScrollTrigger.getById('projects-handoff');
                const section = document.getElementById('proyek');
                if (!trigger && attempts < 120) {
                    attempts += 1;
                    projectJumpFrame =
                        window.requestAnimationFrame(placeAtProjects);
                    return;
                }

                ScrollTrigger.refresh();
                const refreshedTrigger =
                    ScrollTrigger.getById('projects-handoff');
                window.scrollTo({
                    top:
                        refreshedTrigger?.end ??
                        (section
                            ? section.getBoundingClientRect().top +
                              window.scrollY
                            : 0),
                    behavior: 'instant',
                });
                setHeroEntered(true);
            };

            projectJumpFrame = window.requestAnimationFrame(placeAtProjects);
        };

        const jumpToInitialState = (preserveInitialHash = false) => {
            const scene = sceneRef.current;
            const isProjects =
                window.location.hash === '#proyek' ||
                ((initialVisitPending || preserveInitialHash) &&
                    initialProjectsHashRef.current);
            const isAbout =
                window.location.hash === '#tentang' ||
                ((initialVisitPending || preserveInitialHash) &&
                    initialAboutHashRef.current);
            setDirectAboutVisit(isAbout);

            if (isProjects) {
                jumpToProjects();
                return;
            }

            if (isAbout && scene) {
                if (window.location.hash !== '#tentang') {
                    window.history.replaceState(
                        window.history.state,
                        '',
                        `${window.location.pathname}${window.location.search}#tentang`,
                    );
                }
                jumpToAbout();
            } else {
                const sectionId = window.location.hash.slice(1);
                const section = ['perjalanan', 'kontak'].includes(sectionId)
                    ? document.getElementById(sectionId)
                    : null;

                if (section) {
                    const headerHeight =
                        document
                            .querySelector<HTMLElement>('[data-site-header]')
                            ?.getBoundingClientRect().height ?? 0;

                    window.scrollTo({
                        top:
                            section.getBoundingClientRect().top +
                            window.scrollY -
                            headerHeight,
                        behavior: 'instant',
                    });
                    setHeroEntered(true);
                } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
            }
        };

        jumpToInitialState();
        const markUserInteracted = () => {
            userInteracted = true;
            initialVisitPending = false;
        };
        const correctInitialAboutScroll = () => {
            const scene = sceneRef.current;
            const projectTrigger = ScrollTrigger.getById('projects-handoff');
            const projectSection = document.getElementById('proyek');
            const expectedProjectScroll =
                projectTrigger?.end ??
                (projectSection
                    ? projectSection.getBoundingClientRect().top +
                      window.scrollY
                    : 0);
            const aboutTrigger = ScrollTrigger.getById('about-scene');
            const expectedAboutScroll = aboutTrigger
                ? aboutTrigger.start +
                  (aboutTrigger.end - aboutTrigger.start) *
                      ABOUT_CONFIG.restAt
                : scene
                  ? scene.offsetTop +
                    Math.max(0, scene.scrollHeight - window.innerHeight) *
                        ABOUT_CONFIG.restAt
                  : 0;

            if (
                initialVisitPending &&
                !userInteracted &&
                initialProjectsHashRef.current &&
                Math.abs(window.scrollY - expectedProjectScroll) > 2
            ) {
                jumpToProjects();
                return;
            }

            if (
                initialVisitPending &&
                !userInteracted &&
                initialAboutHashRef.current &&
                scene &&
                Math.abs(window.scrollY - expectedAboutScroll) > 2
            ) {
                jumpToInitialState();
            }
        };
        const settleInitialVisit = () => {
            if (!initialVisitPending) return;
            initialVisitPending = false;
            if (!userInteracted) {
                window.requestAnimationFrame(() => jumpToInitialState(true));
            }
        };
        const removeFinishListener = router.on('finish', settleInitialVisit);
        const fallbackTimer = window.setTimeout(settleInitialVisit, 1200);
        window.addEventListener('wheel', markUserInteracted, { passive: true });
        window.addEventListener('touchstart', markUserInteracted, {
            passive: true,
        });
        window.addEventListener('pointerdown', markUserInteracted, {
            passive: true,
        });
        window.addEventListener('keydown', markUserInteracted);
        window.addEventListener('scroll', correctInitialAboutScroll, {
            passive: true,
        });

        return () => {
            window.clearTimeout(fallbackTimer);
            window.cancelAnimationFrame(projectJumpFrame);
            window.cancelAnimationFrame(aboutJumpFrame);
            removeFinishListener();
            window.removeEventListener('wheel', markUserInteracted);
            window.removeEventListener('touchstart', markUserInteracted);
            window.removeEventListener('pointerdown', markUserInteracted);
            window.removeEventListener('keydown', markUserInteracted);
            window.removeEventListener('scroll', correctInitialAboutScroll);
            window.history.scrollRestoration = previousRestoration;
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

        updateReducedMotion();
        mediaQuery.addEventListener('change', updateReducedMotion);

        return () => {
            mediaQuery.removeEventListener('change', updateReducedMotion);
        };
    }, []);

    useEffect(() => {
        const updateScrollState = () => setScrollDismissed(window.scrollY > 80);
        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });

        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        let activeSection:
            | 'home'
            | 'tentang'
            | 'proyek'
            | 'perjalanan'
            | 'kontak' =
            window.location.hash === '#tentang'
                ? 'tentang'
                : window.location.hash === '#proyek'
                  ? 'proyek'
                  : window.location.hash === '#perjalanan'
                    ? 'perjalanan'
                    : window.location.hash === '#kontak'
                      ? 'kontak'
                      : 'home';
        let settleTimer = 0;

        const updateActiveSection = () => {
            const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
            const scrollLength = Math.max(
                1,
                scene.scrollHeight - window.innerHeight,
            );
            const progress = Math.max(
                0,
                Math.min(1, (window.scrollY - sceneTop) / scrollLength),
            );
            const projectsTrigger = ScrollTrigger.getById('projects-handoff');
            const projectsSection = document.getElementById('proyek');
            const projectsBounds = projectsSection?.getBoundingClientRect();
            const projectsVisible =
                Boolean(projectsBounds) &&
                projectsBounds!.top < window.innerHeight &&
                projectsBounds!.bottom > 0;
            const journeySection = document.getElementById('perjalanan');
            const journeyBounds = journeySection?.getBoundingClientRect();
            const journeyVisible =
                Boolean(journeyBounds) &&
                journeyBounds!.top < window.innerHeight * 0.55 &&
                journeyBounds!.bottom > window.innerHeight * 0.45;
            const header =
                document.querySelector<HTMLElement>('[data-site-header]');
            if (header) {
                const edge =
                    progress * ABOUT_CONFIG.duration >= ABOUT_CONFIG.headerStart
                        ? 'panel'
                        : 'frame';
                if (header.dataset.edge !== edge) header.dataset.edge = edge;
            }
            const projectsProgress = projectsTrigger?.progress ?? 0;
            const projectThreshold = activeSection === 'proyek' ? 0.55 : 0.65;

            if (projectsVisible && projectsProgress >= projectThreshold) {
                activeSection = 'proyek';
            } else if (activeSection === 'proyek') {
                activeSection = 'tentang';
            }
            if (journeyVisible) {
                activeSection = 'perjalanan';
            } else if (
                activeSection === 'perjalanan' &&
                journeyBounds &&
                journeyBounds.top >= window.innerHeight * 0.55
            ) {
                activeSection = projectsVisible ? 'proyek' : 'tentang';
            }
            const threshold = ABOUT_CONFIG.activeAboutAt;
            const hysteresis = ABOUT_CONFIG.activeAboutHysteresis;

            if (activeSection === 'proyek' || activeSection === 'perjalanan') {
                // Keep the Projects marker while its handoff section is active.
            } else if (progress < threshold - hysteresis) {
                activeSection = 'home';
            } else if (
                (activeSection === 'home' || activeSection === 'tentang') &&
                progress >= threshold + hysteresis
            ) {
                activeSection = 'tentang';
            } else if (
                activeSection !== 'home' &&
                activeSection !== 'tentang' &&
                progress < 0.99
            ) {
                activeSection = 'tentang';
            }

            setScrollActiveSection(activeSection);
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(() => {
                const path = `${window.location.pathname}${window.location.search}`;
                const nextUrl =
                    activeSection === 'home'
                        ? path
                        : `${path}#${activeSection}`;

                if (
                    `${window.location.pathname}${window.location.search}${window.location.hash}` !==
                    nextUrl
                ) {
                    window.history.replaceState(
                        window.history.state,
                        '',
                        nextUrl,
                    );
                }
            }, 150);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (!visible) return;
                activeSection = visible.target.id as typeof activeSection;
                setScrollActiveSection(activeSection);
                window.clearTimeout(settleTimer);
                settleTimer = window.setTimeout(() => {
                    const path = `${window.location.pathname}${window.location.search}`;
                    window.history.replaceState(
                        window.history.state,
                        '',
                        `${path}#${activeSection}`,
                    );
                }, 150);
            },
            { rootMargin: '-45% 0px -45% 0px' },
        );

        for (const id of ['perjalanan', 'kontak'] as const) {
            const target = document.getElementById(id);
            if (target) observer.observe(target);
        }

        window.addEventListener('scroll', updateActiveSection, {
            passive: true,
        });
        updateActiveSection();

        const handleHashLink = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest<HTMLAnchorElement>('a[href*="#"]');
            if (!anchor || anchor.closest('#fullscreen-menu')) return;

            const url = new URL(anchor.href, window.location.href);
            if (
                url.pathname !== window.location.pathname ||
                !url.hash.startsWith('#')
            ) {
                return;
            }

            const id = url.hash.slice(1) as typeof activeSection;
            if (
                !['home', 'tentang', 'proyek', 'perjalanan', 'kontak'].includes(
                    id,
                )
            ) {
                return;
            }

            event.preventDefault();
            goToSection(id);
        };

        document.addEventListener('click', handleHashLink);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            document.removeEventListener('click', handleHashLink);
            window.clearTimeout(settleTimer);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const frame = frameRef.current;

        if (!frame) {
            return;
        }

        let cancelled = false;
        let timeoutId: number | undefined;

        const fallback = new Promise<void>((resolve) => {
            timeoutId = window.setTimeout(resolve, 1200);
        });
        const decoded = Promise.all(
            Array.from(
                frame.querySelectorAll<HTMLImageElement>('[data-hero-photo]'),
                decodeImage,
            ),
        ).then(() => undefined);

        const fontsReady = document.fonts?.ready ?? Promise.resolve();

        void Promise.race([Promise.all([decoded, fontsReady]), fallback]).then(
            () => {
                if (!cancelled) {
                    setHeroReady(true);
                }

                window.clearTimeout(timeoutId);
            },
        );

        const visibilityObserver = new IntersectionObserver(([entry]) => {
            setHeroVisible(entry.isIntersecting);
        });
        visibilityObserver.observe(frame);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
            visibilityObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!heroReady || heroEntered) return;

        if (reducedMotion || directAboutVisit) {
            setHeroEntered(true);
            return;
        }

        const safetyTimer = window.setTimeout(markHeroEntered, 2000);

        return () => window.clearTimeout(safetyTimer);
    }, [
        directAboutVisit,
        heroEntered,
        heroReady,
        markHeroEntered,
        reducedMotion,
    ]);

    useEffect(() => {
        if (!heroReady && !directAboutVisit) return;
        const prefetch = () => {
            void import('@/components/terminal').then(() => {
                setTerminalChunkReady(true);
            });
        };
        if (directAboutVisit) {
            prefetch();
            return;
        }
        const idleWindow = window as Window & {
            requestIdleCallback?: (
                callback: () => void,
                options?: { timeout: number },
            ) => number;
            cancelIdleCallback?: (handle: number) => void;
        };
        const usesIdleCallback =
            typeof idleWindow.requestIdleCallback === 'function';
        const idleHandle = usesIdleCallback
            ? idleWindow.requestIdleCallback(prefetch, { timeout: 1500 })
            : window.setTimeout(prefetch, 400);

        return () => {
            if (usesIdleCallback && idleWindow.cancelIdleCallback) {
                idleWindow.cancelIdleCallback(idleHandle);
            } else {
                window.clearTimeout(idleHandle);
            }
        };
    }, [directAboutVisit, heroReady]);

    useGSAP(
        () => {
            if (
                !heroReady ||
                !terminalChunkReady ||
                !terminalReady ||
                reducedMotion ||
                !document.documentElement.classList.contains('js')
            )
                return;
            const scene = sceneRef.current;
            const zoom = zoomRef.current;
            const frame = frameRef.current;
            if (!scene || !zoom || !frame) return;
            const media = gsap.matchMedia();
            const createTrigger = (isMobile: boolean) => {
                const photo =
                    scene.querySelector<HTMLElement>('[data-about-photo]');
                const terminalBody =
                    terminalRef.current?.querySelector<HTMLElement>(
                        '.terminal-window',
                    );
                const terminalContent = terminalBody
                    ? (
                          Array.from(terminalBody.children) as HTMLElement[]
                      ).filter(
                          (child) =>
                              !child.matches('[data-terminal-arch-background]'),
                      )
                    : [];
                const roll =
                    scene.querySelector<HTMLElement>('[data-about-roll]');
                const aboutLayer =
                    scene.querySelector<HTMLElement>('[data-about-layer]');
                const contentElements = scene.querySelectorAll<HTMLElement>(
                    '[data-about-content]',
                );
                const terminalRoot =
                    terminalRef.current?.querySelector<HTMLElement>(
                        '.about-terminal',
                    );
                const terminalPosition = terminalRef.current;
                const header =
                    document.querySelector<HTMLElement>('[data-site-header]');
                if (
                    !photo ||
                    !terminalBody ||
                    !terminalPosition ||
                    terminalContent.length === 0 ||
                    !roll ||
                    !aboutLayer
                )
                    return () => {};

                aboutLayer.style.setProperty(
                    '--about-terminal-left',
                    isMobile
                        ? ABOUT_CONFIG.terminal.mobileLeft
                        : ABOUT_CONFIG.terminal.desktopLeft,
                );
                aboutLayer.style.setProperty(
                    '--about-terminal-right',
                    isMobile
                        ? ABOUT_CONFIG.terminal.mobileRight
                        : ABOUT_CONFIG.terminal.desktopRight,
                );
                aboutLayer.style.setProperty(
                    '--about-terminal-top',
                    isMobile
                        ? ABOUT_CONFIG.terminal.mobileTop
                        : ABOUT_CONFIG.terminal.desktopTop,
                );
                aboutLayer.style.setProperty(
                    '--about-terminal-height',
                    isMobile ? 'auto' : ABOUT_CONFIG.terminal.desktopHeight,
                );
                aboutLayer.style.setProperty(
                    '--about-terminal-bottom',
                    isMobile ? ABOUT_CONFIG.terminal.mobileBottom : 'auto',
                );

                const measuredZoom = () => {
                    const { width, height } = frame.getBoundingClientRect();
                    const horizontal =
                        (width * 0.5) / (width * 0.5 - width * 0.042);
                    const vertical =
                        (height * 0.5) / (height * 0.5 - height * 0.01);
                    return (
                        Math.max(
                            ABOUT_CONFIG.zoomSafety,
                            horizontal,
                            vertical,
                        ) + 0.05
                    );
                };
                const photoScale = () =>
                    isMobile
                        ? ABOUT_CONFIG.mobilePhotoScale
                        : ABOUT_CONFIG.photoScale *
                          (window.innerWidth /
                              window.innerHeight /
                              ABOUT_CONFIG.photoReferenceAspect);
                const getPhotoX = (centerXPct: number) => {
                    if (isMobile) return 0;

                    const responsiveOffset = window.matchMedia(
                        '(min-width: 768px) and (max-aspect-ratio: 4/5)',
                    ).matches
                        ? window.innerWidth * 0.02
                        : 0;

                    return (
                        (window.innerWidth * centerXPct -
                            frame.clientWidth * 0.5 -
                            photoScale() * responsiveOffset) /
                        measuredZoom()
                    );
                };
                const getPhotoY = (headTopPct: number) => {
                    const scale = photoScale();
                    const imageHeight = isMobile
                        ? 1.95
                        : ABOUT_CONFIG.photoBaseHeight;
                    const cssTop = isMobile ? 0.184 : 0.061;
                    const visibleHeadStart =
                        cssTop +
                        ABOUT_CONFIG.photoTopPadding.light * imageHeight;

                    return (
                        (window.innerHeight *
                            (headTopPct -
                                0.5 -
                                scale * (visibleHeadStart - 0.5))) /
                        measuredZoom()
                    );
                };
                const aboutPhotoHeadTop = isMobile
                    ? Math.max(
                          ABOUT_CONFIG.mobilePhotoEndY,
                          (Math.max(56, window.innerHeight * 0.069) + 10) /
                              window.innerHeight,
                      )
                    : ABOUT_CONFIG.photoEndY;
                let terminalInteractive = false;
                let previousContentInert: boolean | null = null;
                let wasAtStart = false;
                const setTerminalInteractive = (active: boolean) => {
                    if (terminalInteractive === active) return;
                    terminalInteractive = active;
                    if (terminalRoot) terminalRoot.inert = !active;
                    if (active) {
                        aboutLayer.style.pointerEvents = 'auto';
                    } else {
                        aboutLayer.style.removeProperty('pointer-events');
                    }
                    setTerminalActive(active);
                };
                if (terminalRoot) terminalRoot.inert = true;
                const reveal = { u: 0 };
                const updateUnroll = () => {
                    const u = Math.max(0, Math.min(1, reveal.u));
                    terminalBody.style.clipPath = isMobile
                        ? 'inset(0 0 ' +
                          (1 - u) * 100 +
                          '% 0 round var(--terminal-radius))'
                        : 'inset(0 ' +
                          (1 - u) * 100 +
                          '% 0 0 round var(--terminal-radius))';
                    gsap.set(
                        roll,
                        isMobile
                            ? {
                                  y:
                                      terminalBody.getBoundingClientRect()
                                          .height * u,
                              }
                            : {
                                  x:
                                      terminalBody.getBoundingClientRect()
                                          .width * u,
                              },
                    );
                };
                let timeline: gsap.core.Timeline;
                timeline = gsap.timeline({
                    defaults: { ease: 'none' },
                    scrollTrigger: {
                        id: 'about-scene',
                        trigger: scene,
                        scrub: isMobile
                            ? ABOUT_CONFIG.mobileScrub
                            : ABOUT_CONFIG.desktopScrub,
                        start: 'top top',
                        end: 'bottom bottom',
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            const contentInert = self.progress > 0.02;
                            if (contentInert !== previousContentInert) {
                                contentElements.forEach((element) => {
                                    element.inert = contentInert;
                                    element.style.pointerEvents = contentInert
                                        ? 'none'
                                        : '';
                                });
                                previousContentInert = contentInert;
                            }
                            if (self.progress > 0) wasAtStart = false;
                        },
                    },
                    onUpdate: () => {
                        const time = timeline.time();
                        if (header) {
                            const edge =
                                time >= ABOUT_CONFIG.headerStart
                                    ? 'panel'
                                    : 'frame';
                            if (header.dataset.edge !== edge)
                                header.dataset.edge = edge;
                        }
                        if (time >= ABOUT_CONFIG.exitStart) {
                            setTerminalInteractive(false);
                        } else if (
                            !terminalInteractive &&
                            time >= ABOUT_CONFIG.terminalActiveAt
                        )
                            setTerminalInteractive(true);
                        else if (
                            terminalInteractive &&
                            time < ABOUT_CONFIG.terminalInactiveAt
                        )
                            setTerminalInteractive(false);
                        if (time <= 0.0001 && !wasAtStart) {
                            wasAtStart = true;
                            gsap.set(
                                [
                                    zoom,
                                    photo,
                                    aboutLayer,
                                    terminalBody,
                                    terminalPosition,
                                    ...terminalContent,
                                    roll,
                                ],
                                { clearProps: 'all' },
                            );
                            if (terminalRoot) terminalRoot.inert = true;
                            setTerminalInteractive(false);
                            if (header) header.dataset.edge = 'frame';
                            contentElements.forEach((element) => {
                                element.inert = false;
                                element.style.pointerEvents = '';
                            });
                        }
                    },
                });
                timeline.fromTo(
                    zoom,
                    { scale: 1 },
                    {
                        scale: measuredZoom,
                        duration: ABOUT_CONFIG.zoomEnd,
                        ease: ABOUT_CONFIG.easeZoom,
                        immediateRender: false,
                    },
                    0,
                );
                timeline.to(
                    scene.querySelectorAll('[data-about-fade]'),
                    { opacity: 0, duration: ABOUT_CONFIG.contentFadeEnd },
                    0,
                );
                timeline.to(
                    scene.querySelectorAll('[data-about-copy]'),
                    {
                        x: () => -window.innerWidth * 0.06,
                        opacity: 0,
                        duration: ABOUT_CONFIG.contentExitEnd,
                    },
                    0,
                );
                timeline.to(
                    scene.querySelectorAll('[data-about-deck]'),
                    {
                        x: () => window.innerWidth * 0.06,
                        opacity: 0,
                        duration: ABOUT_CONFIG.contentExitEnd,
                    },
                    0,
                );
                timeline.to(
                    photo,
                    {
                        x: () => getPhotoX(ABOUT_CONFIG.photoCenterX),
                        y: () => getPhotoY(aboutPhotoHeadTop),
                        scale: () => photoScale() / measuredZoom(),
                        duration:
                            ABOUT_CONFIG.photoEnd - ABOUT_CONFIG.photoStart,
                        ease: ABOUT_CONFIG.easePhoto,
                    },
                    ABOUT_CONFIG.photoStart,
                );
                timeline.fromTo(
                    aboutLayer,
                    { autoAlpha: 0 },
                    { autoAlpha: 1, duration: 0.001, immediateRender: false },
                    ABOUT_CONFIG.rollStart,
                );
                timeline.fromTo(
                    roll,
                    isMobile
                        ? { y: '100dvh', autoAlpha: 1 }
                        : { x: '100vw', autoAlpha: 1 },
                    isMobile
                        ? {
                              y: 0,
                              duration:
                                  ABOUT_CONFIG.rollEnd - ABOUT_CONFIG.rollStart,
                              ease: ABOUT_CONFIG.easeRoll,
                              immediateRender: false,
                          }
                        : {
                              x: 0,
                              duration:
                                  ABOUT_CONFIG.rollEnd - ABOUT_CONFIG.rollStart,
                              ease: ABOUT_CONFIG.easeRoll,
                              immediateRender: false,
                          },
                    ABOUT_CONFIG.rollStart,
                );
                timeline.to(
                    reveal,
                    {
                        u: 1,
                        duration:
                            ABOUT_CONFIG.unrollEnd - ABOUT_CONFIG.unrollStart,
                        ease: ABOUT_CONFIG.easeUnroll,
                        onUpdate: updateUnroll,
                    },
                    ABOUT_CONFIG.unrollStart,
                );
                timeline.to(
                    roll,
                    { autoAlpha: 0, duration: 0.3 },
                    ABOUT_CONFIG.rollFadeStart,
                );
                timeline.fromTo(
                    terminalContent,
                    { opacity: 0 },
                    {
                        opacity: 1,
                        duration:
                            ABOUT_CONFIG.contentEnd - ABOUT_CONFIG.contentStart,
                        ease: 'power1.out',
                        immediateRender: false,
                    },
                    ABOUT_CONFIG.contentStart,
                );
                timeline.to(
                    terminalPosition,
                    {
                        x: () => window.innerWidth,
                        opacity: 0,
                        duration: ABOUT_CONFIG.exitDuration,
                        ease: 'power2.in',
                    },
                    ABOUT_CONFIG.exitStart,
                );
                timeline.addLabel(
                    'aboutRest',
                    ABOUT_CONFIG.restAt * ABOUT_CONFIG.duration,
                );
                if (timeline.duration() < ABOUT_CONFIG.duration)
                    timeline.to(
                        {},
                        {
                            duration:
                                ABOUT_CONFIG.duration - timeline.duration(),
                        },
                        timeline.duration(),
                    );
                if (
                    window.location.hash === '#tentang' &&
                    window.scrollY > window.innerHeight
                ) {
                    timeline.progress(ABOUT_CONFIG.restAt);
                }
                window.requestAnimationFrame(() => {
                    const p = timeline.scrollTrigger?.progress ?? 0;
                    if (header)
                        header.dataset.edge =
                            p * ABOUT_CONFIG.duration >=
                            ABOUT_CONFIG.headerStart
                                ? 'panel'
                                : 'frame';
                });
                return () => {
                    contentElements.forEach((element) => {
                        element.inert = false;
                        element.style.pointerEvents = '';
                    });
                    if (header) header.dataset.edge = 'frame';
                    if (terminalRoot) terminalRoot.inert = true;
                    setTerminalActive(false);
                    terminalInteractive = false;
                    timeline.scrollTrigger?.kill();
                    timeline.kill();
                };
            };
            media.add('(min-width: 768px)', () => createTrigger(false));
            media.add('(max-width: 767px)', () => createTrigger(true));
            const refreshFrame = window.requestAnimationFrame(() =>
                ScrollTrigger.refresh(),
            );
            let refreshTimeout = 0;
            const fontReadyTimeout = new Promise<void>((resolve) => {
                refreshTimeout = window.setTimeout(resolve, 1200);
            });
            let cancelled = false;
            void Promise.race([document.fonts.ready, fontReadyTimeout]).then(
                () => {
                    if (cancelled) return;
                    window.clearTimeout(refreshTimeout);
                    ScrollTrigger.refresh();
                },
            );
            return () => {
                cancelled = true;
                window.cancelAnimationFrame(refreshFrame);
                window.clearTimeout(refreshTimeout);
                media.revert();
            };
        },
        {
            scope: sceneRef,
            dependencies: [
                heroReady,
                reducedMotion,
                terminalChunkReady,
                terminalReady,
            ],
            revertOnUpdate: true,
        },
    );
    useEffect(() => {
        if (!heroReady) return;
        const prefetch = () => {
            void import('@/components/terminal').then(() => {
                setTerminalChunkReady(true);
            });
        };
        const idleWindow = window as Window & {
            requestIdleCallback?: (
                callback: () => void,
                options?: { timeout: number },
            ) => number;
            cancelIdleCallback?: (handle: number) => void;
        };
        const usesIdleCallback =
            typeof idleWindow.requestIdleCallback === 'function';
        const idleHandle = usesIdleCallback
            ? idleWindow.requestIdleCallback(prefetch, { timeout: 1500 })
            : window.setTimeout(prefetch, 400);

        return () => {
            if (usesIdleCallback && idleWindow.cancelIdleCallback) {
                idleWindow.cancelIdleCallback(idleHandle);
            } else {
                window.clearTimeout(idleHandle);
            }
        };
    }, [heroReady]);

    useEffect(() => {
        const frame = frameRef.current;

        if (!frame) {
            return;
        }

        let animationFrame = 0;
        const measure = () => {
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(() => {
                const { width, height } = frame.getBoundingClientRect();

                if (width > 0 && height > 0) {
                    setFrameShape(buildFramePath(width, height));
                }
            });
        };

        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        measure();

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const panelClip = frameShape ? `path("${frameShape.path}")` : undefined;

    return (
        <div className="home-page relative w-full overflow-x-clip">
            <section
                ref={sceneRef}
                className="about-scene relative w-full"
                data-about-scene
                style={
                    {
                        '--about-scroll-distance': ABOUT_CONFIG.desktopScroll,
                        '--about-mobile-scroll-distance':
                            ABOUT_CONFIG.mobileScroll,
                    } as CSSProperties
                }
            >
                <div className="about-sticky-stage">
                    <div
                        ref={zoomRef}
                        className="home-zoom absolute inset-0"
                        data-about-zoom
                    >
                        <main
                            ref={frameRef}
                            data-hero-ready={heroReady}
                            data-hero-entered={heroEntered}
                            data-about-direct={directAboutVisit}
                            className={`home-frame relative isolate h-dvh w-full overflow-hidden overflow-x-clip bg-[var(--frame-bg)] text-[var(--frame-fg)] transition-colors duration-500 ease-in-out motion-reduce:transition-none ${transitionReady}`}
                        >
                            <section
                                aria-label="Firman Maulana Syabani, IT Developer"
                                className={`absolute inset-0 z-[1] overflow-hidden rounded-[clamp(16px,2.5vw,48px)] bg-[var(--panel-bg)] text-[var(--panel-fg)] transition-colors duration-500 ease-in-out [clip-path:inset(max(64px,7.5vh)_4.2%_5.3%_round_clamp(16px,2.5vw,48px))] motion-reduce:transition-none max-[767px]:[clip-path:inset(64px_3%_44px_round_16px)] ${transitionReady}`}
                                style={
                                    panelClip
                                        ? { clipPath: panelClip }
                                        : undefined
                                }
                            >
                                <div
                                    data-about-copy
                                    data-about-content
                                    className="absolute inset-0"
                                >
                                    <div
                                        className="home-copy absolute z-[1] whitespace-nowrap"
                                        onAnimationEnd={(event) =>
                                            event.currentTarget.style.removeProperty(
                                                'will-change',
                                            )
                                        }
                                        style={
                                            heroReady && !reducedMotion
                                                ? {
                                                      willChange:
                                                          'transform, opacity',
                                                  }
                                                : undefined
                                        }
                                    >
                                        <h1
                                            aria-label="Firman Maulana Syabani"
                                            className="home-name m-0 p-0 font-michroma uppercase"
                                        >
                                            <span className="home-name-first block">
                                                FIRMAN MAULANA
                                            </span>
                                            <span className="home-name-second flex items-baseline">
                                                <span className="home-name-outline text-transparent">
                                                    SYABANI.
                                                </span>
                                                <span
                                                    aria-hidden="true"
                                                    className="home-role-it"
                                                >
                                                    IT
                                                </span>
                                            </span>
                                        </h1>

                                        <p
                                            aria-label="IT DEVELOPER"
                                            className="home-role m-0 p-0 text-left font-michroma uppercase"
                                        >
                                            <span aria-hidden="true">
                                                DEVELOPER
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div
                                    data-about-photo
                                    className="about-photo-transform pointer-events-none absolute inset-0 z-[2]"
                                >
                                    <div
                                        className="hero-photo pointer-events-none absolute inset-0 z-[2]"
                                        style={
                                            heroReady && !reducedMotion
                                                ? {
                                                      willChange:
                                                          'transform, opacity',
                                                  }
                                                : undefined
                                        }
                                        onAnimationEnd={(event) => {
                                            if (
                                                event.target ===
                                                event.currentTarget
                                            ) {
                                                event.currentTarget.style.removeProperty(
                                                    'will-change',
                                                );
                                            }
                                        }}
                                    >
                                        {lightImageAvailable && (
                                            <img
                                                data-hero-photo
                                                src="/images/hero-light.webp"
                                                alt={homeContent.photoAlt}
                                                width={853}
                                                height={1844}
                                                loading="eager"
                                                fetchPriority="high"
                                                onError={() =>
                                                    setLightImageAvailable(
                                                        false,
                                                    )
                                                }
                                                draggable={false}
                                                className={`pointer-events-none absolute top-[6.1%] left-1/2 z-[2] h-[185%] w-auto max-w-none -translate-x-1/2 object-contain object-top opacity-100 transition-opacity duration-500 ease-in-out select-none motion-reduce:transition-none max-[767px]:top-[18.4%] max-[767px]:h-[195%] dark:opacity-0 ${transitionReady}`}
                                            />
                                        )}
                                        {darkImageAvailable && (
                                            <img
                                                data-hero-photo
                                                src="/images/hero-dark.webp"
                                                alt=""
                                                width={853}
                                                height={1844}
                                                loading="eager"
                                                fetchPriority="high"
                                                onError={() =>
                                                    setDarkImageAvailable(false)
                                                }
                                                aria-hidden="true"
                                                draggable={false}
                                                className={`pointer-events-none absolute top-[6.1%] left-1/2 z-[2] h-[185%] w-auto max-w-none -translate-x-1/2 object-contain object-top opacity-0 transition-opacity duration-500 ease-in-out select-none motion-reduce:transition-none max-[767px]:top-[18.4%] max-[767px]:h-[195%] dark:opacity-100 ${transitionReady}`}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div data-about-fade data-about-content>
                                    <MenuMarquee />
                                </div>

                                <div
                                    data-about-fade
                                    data-about-content
                                    className="pointer-events-none absolute inset-0 z-[4]"
                                >
                                    <div
                                        data-scrolled={scrollDismissed}
                                        className="hero-scroll-entrance pointer-events-auto absolute top-[92%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                                        onAnimationEnd={(event) => {
                                            if (
                                                event.target ===
                                                event.currentTarget
                                            ) {
                                                event.currentTarget.style.removeProperty(
                                                    'will-change',
                                                );
                                            }
                                        }}
                                        style={
                                            heroReady && !reducedMotion
                                                ? { willChange: 'opacity' }
                                                : undefined
                                        }
                                    >
                                        <a
                                            href="#tentang"
                                            aria-label={t('scrollDown')}
                                            data-hero-visible={heroVisible}
                                            className="hero-scroll flex min-h-11 min-w-11 items-center justify-center p-1 text-[var(--panel-fg)] opacity-100 transition-opacity duration-200 hover:opacity-60 focus-visible:rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-fg)]"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                goToSection('tentang');
                                            }}
                                        >
                                            <ArrowDown
                                                aria-hidden="true"
                                                className="hero-scroll-icon size-8 stroke-[1.75] max-[767px]:size-7"
                                            />
                                        </a>
                                    </div>
                                </div>
                            </section>

                            {frameShape && (
                                <svg
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible transition-colors duration-500 motion-reduce:transition-none ${transitionReady}`}
                                    viewBox={`0 0 ${frameRef.current?.clientWidth ?? 1} ${frameRef.current?.clientHeight ?? 1}`}
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d={frameShape.path}
                                        fill="var(--panel-bg)"
                                        stroke="var(--frame-bg)"
                                        strokeWidth="1"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            )}

                            <footer
                                data-about-fade
                                data-about-content
                                className="absolute right-[4.2%] bottom-[2.2%] left-[4.2%] z-20 hidden items-center justify-between text-[clamp(8px,0.65vw,12px)] font-medium text-[var(--frame-fg)] uppercase min-[768px]:flex"
                            >
                                <span>{t('copyright')}</span>
                                <span className="normal-case">
                                    {t('freelanceAvailability')}
                                </span>
                            </footer>
                            <footer
                                data-about-fade
                                data-about-content
                                className="absolute right-0 bottom-1 left-0 z-20 flex justify-center text-[10px] font-medium text-[var(--frame-fg)] uppercase min-[768px]:hidden"
                            >
                                <span>{t('copyright')}</span>
                            </footer>
                        </main>
                        <div
                            data-about-deck
                            data-about-content
                            className="about-deck-transform absolute inset-0"
                        >
                            <ProjectSummary
                                heroReady={heroReady}
                                heroEntered={heroEntered}
                                reducedMotion={reducedMotion}
                                onEntranceComplete={markHeroEntered}
                            />
                        </div>
                    </div>
                    <section
                        id="tentang"
                        data-about-layer
                        className="about-layer absolute inset-0 z-20 opacity-0"
                        aria-labelledby="about-title"
                    >
                        <div
                            className="about-fallback-photo"
                            aria-hidden="true"
                        >
                            <img
                                className="about-photo-light"
                                src="/images/hero-light.webp"
                                alt=""
                                width={853}
                                height={1844}
                                loading="lazy"
                                decoding="async"
                            />
                            <img
                                className="about-photo-dark"
                                src="/images/hero-dark.webp"
                                alt=""
                                width={853}
                                height={1844}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <h2 id="about-title" className="about-heading">
                            {t('about')}
                        </h2>
                        <p className="about-summary">{aboutSummary}</p>
                        <div
                            data-about-roll
                            className="about-roll"
                            aria-hidden="true"
                        />
                        <div
                            ref={terminalRef}
                            className="about-terminal-position"
                        >
                            {terminalChunkReady ? (
                                <Suspense
                                    fallback={
                                        <div
                                            className="terminal-window"
                                            aria-hidden="true"
                                        />
                                    }
                                >
                                    <LazyTerminal
                                        active={terminalActive || reducedMotion}
                                        themeTransitionsReady={
                                            themeTransitionsReady
                                        }
                                        onReady={markTerminalReady}
                                        onExit={() => goToSection('home')}
                                    />
                                </Suspense>
                            ) : (
                                <div
                                    className="terminal-window"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    </section>
                </div>
            </section>
            <ProjectShowcase />
            <JourneyShowcase />
            <ContactShowcase />
        </div>
    );
}
