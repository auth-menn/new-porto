import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_CONFIG } from '@/data/about-config';
import { projects } from '@/data/projects';
import { PROJECT_CONFIG } from '@/data/project-config';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger);

type Device = 'laptop' | 'mobile';

function ProjectScreen({
    project,
    index,
    language,
    active,
}: {
    project: (typeof projects)[number];
    index: number;
    language: 'id' | 'en';
    active: boolean;
}) {
    const [imageMissing, setImageMissing] = useState(false);
    const title = language === 'id' ? project.titleId : project.titleEn;

    return (
        <article
            className="project-screen-card"
            aria-label={`${String(index + 1).padStart(2, '0')}: ${title}`}
            aria-hidden={!active}
            inert={!active}
        >
            {!imageMissing ? (
                <img
                    src={`/images/projects/project-${index + 1}.webp`}
                    alt={title}
                    width="1200"
                    height="750"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setImageMissing(true)}
                />
            ) : (
                <div className="project-screen-placeholder" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{title}</strong>
                </div>
            )}
        </article>
    );
}

export function ProjectShowcase() {
    const { language, t } = useLang();
    const sectionRef = useRef<HTMLElement>(null);
    const photoRef = useRef<HTMLDivElement>(null);
    const photoFlyRef = useRef<HTMLDivElement>(null);
    const laptopRef = useRef<HTMLDivElement>(null);
    const phoneRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLParagraphElement>(null);
    const counterCurrentRef = useRef<HTMLSpanElement>(null);
    const counterPreviousRef = useRef<HTMLSpanElement>(null);
    const viewportRefs = useRef<Array<HTMLDivElement | null>>([]);
    const viewportHeightsRef = useRef<number[]>([]);
    const activeIndexRef = useRef(0);
    const previousCounterRef = useRef(0);
    const syncingScrollRef = useRef(false);
    const programmaticSwitchRef = useRef(false);
    const switchTimelineRef = useRef<gsap.core.Timeline | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        setPortalTarget(document.body);
        const section = sectionRef.current;
        if (!section) return;

        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const start = sectionTop - window.innerHeight;
        const progress = Math.max(
            0,
            Math.min(1, (window.scrollY - start) / window.innerHeight),
        );
        const isReducedMotion = window.matchMedia(
            PROJECT_CONFIG.animation.reducedMotionQuery,
        ).matches;
        const initialOwner =
            window.location.hash === '#proyek'
                ? 'projects'
                : progress <= PROJECT_CONFIG.animation.ownerAboutAt
                  ? 'about'
                  : progress >= PROJECT_CONFIG.animation.ownerProjectsAt
                    ? 'projects'
                    : isReducedMotion
                      ? progress < 0.5
                          ? 'about'
                          : 'projects'
                      : 'fly';

        document.documentElement.dataset.photoOwner = initialOwner;
    }, []);
    const desktopStyle = {
        '--project-section-height': PROJECT_CONFIG.desktop.sectionHeight,
        '--project-laptop-height': PROJECT_CONFIG.desktop.laptopHeight,
        '--project-laptop-width': PROJECT_CONFIG.desktop.laptopWidth,
        '--project-tablet-laptop-height':
            PROJECT_CONFIG.desktop.tabletLaptopHeight,
        '--project-tablet-laptop-width':
            PROJECT_CONFIG.desktop.tabletLaptopWidth,
        '--project-phone-height': `calc(var(--project-laptop-height) * ${PROJECT_CONFIG.desktop.phoneScale})`,
        '--project-phone-width': PROJECT_CONFIG.desktop.phoneWidth,
        '--project-tablet-phone-width': PROJECT_CONFIG.desktop.tabletPhoneWidth,
        '--project-laptop-right': PROJECT_CONFIG.desktop.laptopRight,
        '--project-phone-right': PROJECT_CONFIG.desktop.phoneRight,
        '--project-laptop-bottom': PROJECT_CONFIG.desktop.laptopBottom,
        '--project-phone-bottom': PROJECT_CONFIG.desktop.phoneBottom,
        '--project-phone-overlap': PROJECT_CONFIG.desktop.phoneOverlap,
        '--project-laptop-aspect': PROJECT_CONFIG.desktopDeviceAspect.laptop,
        '--project-phone-aspect': PROJECT_CONFIG.desktopDeviceAspect.phone,
        '--project-laptop-screen-top':
            PROJECT_CONFIG.frameMetrics.laptop.screen.top,
        '--project-laptop-screen-right':
            PROJECT_CONFIG.frameMetrics.laptop.screen.right,
        '--project-laptop-screen-bottom':
            PROJECT_CONFIG.frameMetrics.laptop.screen.bottom,
        '--project-laptop-screen-left':
            PROJECT_CONFIG.frameMetrics.laptop.screen.left,
        '--project-phone-screen-top':
            PROJECT_CONFIG.frameMetrics.phone.screen.top,
        '--project-phone-screen-right':
            PROJECT_CONFIG.frameMetrics.phone.screen.right,
        '--project-phone-screen-bottom':
            PROJECT_CONFIG.frameMetrics.phone.screen.bottom,
        '--project-phone-screen-left':
            PROJECT_CONFIG.frameMetrics.phone.screen.left,
        '--project-screen-bleed': `${PROJECT_CONFIG.screenBleedPct * 100}cqw`,
        '--project-arrow-size': `${PROJECT_CONFIG.desktop.arrowSize}px`,
        '--project-arrow-gap': PROJECT_CONFIG.desktop.arrowGap,
        '--project-counter-right': PROJECT_CONFIG.desktop.counterRight,
        '--project-counter-bottom': PROJECT_CONFIG.desktop.counterBottom,
        '--project-previous-arrow-left':
            PROJECT_CONFIG.desktop.previousArrowLeft,
        '--project-mobile-laptop-height': PROJECT_CONFIG.mobile.laptopHeight,
        '--project-mobile-laptop-width': PROJECT_CONFIG.mobile.laptopWidth,
        '--project-mobile-phone-width': PROJECT_CONFIG.mobile.phoneWidth,
        '--project-mobile-laptop-aspect':
            PROJECT_CONFIG.mobileDeviceAspect.laptop,
        '--project-mobile-phone-aspect':
            PROJECT_CONFIG.mobileDeviceAspect.phone,
        '--project-mobile-phone-scale': PROJECT_CONFIG.mobile.phoneScale,
        '--project-mobile-laptop-top-scale':
            PROJECT_CONFIG.mobile.laptopTopOffset,
        '--project-mobile-phone-top-offset':
            PROJECT_CONFIG.mobile.phoneTopOffset,
        '--project-mobile-left': PROJECT_CONFIG.mobile.left,
        '--project-mobile-right': PROJECT_CONFIG.mobile.right,
        '--project-mobile-overlap': PROJECT_CONFIG.mobile.overlap,
        '--project-mobile-center-y': PROJECT_CONFIG.mobile.groupCenterY,
        '--project-mobile-arrow-size': `${PROJECT_CONFIG.mobile.arrowSize}px`,
        '--project-mobile-control-bottom': PROJECT_CONFIG.mobile.controlBottom,
        '--project-mobile-counter-offset': PROJECT_CONFIG.mobile.counterOffset,
        '--project-z-index': PROJECT_CONFIG.zIndex,
        '--project-fly-z-index': PROJECT_CONFIG.flight.zIndex,
        '--project-count': projects.length,
        '--project-photo-clip-overhang': `-${PROJECT_CONFIG.photoClipOverhangVh * 100}dvh`,
    } as CSSProperties;

    const setCurrentIndex = useCallback((index: number) => {
        const nextIndex = Math.max(0, Math.min(projects.length - 1, index));
        activeIndexRef.current = nextIndex;
        setActiveIndex((current) =>
            current === nextIndex ? current : nextIndex,
        );
    }, []);

    useGSAP(
        () => {
            const section = sectionRef.current;
            const projectPhoto = photoRef.current;
            const photoFly = photoFlyRef.current;
            const laptop = laptopRef.current;
            const phone = phoneRef.current;
            const title = titleRef.current;
            const controls = controlsRef.current;
            const counter = counterRef.current;
            if (
                !section ||
                !projectPhoto ||
                !photoFly ||
                !laptop ||
                !phone ||
                !title ||
                !controls ||
                !counter
            ) {
                return;
            }

            let cancelled = false;
            let setupFrame = 0;
            const media = gsap.matchMedia();
            const aboutPhoto = document.querySelector<HTMLImageElement>(
                '[data-about-photo] .hero-photo img[data-hero-photo]',
            );
            const initialize = async () => {
                const photos = Array.from(
                    section.querySelectorAll<HTMLImageElement>(
                        '.project-photo img',
                    ),
                ).concat(
                    Array.from(
                        photoFly.querySelectorAll<HTMLImageElement>('img'),
                    ),
                );
                if (aboutPhoto) photos.push(aboutPhoto);
                await Promise.all([
                    ...photos.map((image) => image.decode().catch(() => {})),
                    document.fonts?.ready ?? Promise.resolve(),
                ]);
                if (cancelled) return;

                const create = () => {
                    const reducedMotion = window.matchMedia(
                        PROJECT_CONFIG.animation.reducedMotionQuery,
                    ).matches;
                    const isMobile = window.matchMedia(
                        `(max-width: ${PROJECT_CONFIG.mobile.breakpoint - 1}px)`,
                    ).matches;
                    let terminalInteractivity = false;
                    let photoPositions: ReturnType<typeof applyPhotoGeometry>;

                    const readAboutBox = (): DOMRect | null => {
                        if (!aboutPhoto) return null;
                        const stickyStage = document.querySelector<HTMLElement>(
                            '.about-sticky-stage',
                        );
                        if (!stickyStage) return null;
                        const aboutTrigger =
                            ScrollTrigger.getById('about-scene');
                        const aboutTimeline = aboutTrigger?.animation;
                        const oldTime = aboutTimeline?.time();
                        if (aboutTimeline) {
                            aboutTimeline.time(
                                ABOUT_CONFIG.restAt * ABOUT_CONFIG.duration,
                                true,
                            );
                        }
                        const photoBounds = aboutPhoto.getBoundingClientRect();
                        const stickyStageTop =
                            stickyStage.getBoundingClientRect().top;
                        if (aboutTimeline && oldTime !== undefined) {
                            aboutTimeline.time(oldTime, true);
                        }
                        const stageOffset = Math.max(0, -stickyStageTop);
                        return photoBounds.width > 0 && photoBounds.height > 0
                            ? new DOMRect(
                                  photoBounds.left,
                                  photoBounds.top + stageOffset,
                                  photoBounds.width,
                                  photoBounds.height,
                              )
                            : null;
                    };

                    const getPhotoRestBox = (bounds: DOMRect) => {
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        const mobile = window.matchMedia(
                            `(max-width: ${PROJECT_CONFIG.mobile.breakpoint - 1}px)`,
                        ).matches;
                        const headTopPct = mobile
                            ? (PROJECT_CONFIG.mobile.photoHeadTopMinPct +
                                  PROJECT_CONFIG.mobile.photoHeadTopMaxPct) /
                              2
                            : PROJECT_CONFIG.headTopPct;
                        const centerXPct = mobile
                            ? PROJECT_CONFIG.mobile.photoCenterXPct
                            : PROJECT_CONFIG.centerXPct;
                        const topPadding =
                            PROJECT_CONFIG.photoTopPadding[
                                document.documentElement.classList.contains(
                                    'dark',
                                )
                                    ? 'dark'
                                    : 'light'
                            ];
                        const left =
                            viewportWidth * centerXPct - bounds.width / 2;
                        const top =
                            viewportHeight * headTopPct -
                            bounds.height * topPadding;

                        return {
                            left,
                            top,
                            width: bounds.width,
                            height: bounds.height,
                        };
                    };

                    const applyPhotoGeometry = () => {
                        const measured = readAboutBox();
                        if (!measured) return null;
                        const rest = getPhotoRestBox(measured);
                        gsap.set(projectPhoto, {
                            left: rest.left,
                            top:
                                rest.top +
                                window.innerHeight *
                                    PROJECT_CONFIG.photoClipOverhangVh,
                            width: rest.width,
                            height: rest.height,
                        });

                        let offsetElement: HTMLElement | null = projectPhoto;
                        let x = 0;
                        let y = 0;
                        while (offsetElement && offsetElement !== section) {
                            x += offsetElement.offsetLeft;
                            y += offsetElement.offsetTop;
                            offsetElement =
                                offsetElement.offsetParent as HTMLElement | null;
                        }

                        return {
                            about: {
                                x: measured.x,
                                y: measured.y,
                                width: measured.width,
                                height: measured.height,
                            },
                            projects: {
                                x,
                                y,
                                width: projectPhoto.offsetWidth,
                                height: projectPhoto.offsetHeight,
                            },
                        };
                    };

                    photoPositions = applyPhotoGeometry();
                    if (reducedMotion) {
                        gsap.set([laptop, phone, title, controls, counter], {
                            autoAlpha: 1,
                            clearProps: 'transform',
                        });
                        laptop.inert = false;
                        phone.inert = false;
                        controls.inert = false;
                        section.dataset.motion = 'reduced';
                        ScrollTrigger.create({
                            trigger: section,
                            start: 'top top',
                            onEnter: () => {
                                document.documentElement.dataset.photoOwner =
                                    'projects';
                            },
                            onLeaveBack: () => {
                                document.documentElement.dataset.photoOwner =
                                    'about';
                            },
                        });
                        return;
                    }

                    laptop.inert = true;
                    phone.inert = true;
                    controls.inert = true;

                    const updatePhotoOwner = (progress: number) => {
                        const owner =
                            progress <= PROJECT_CONFIG.animation.ownerAboutAt
                                ? 'about'
                                : progress >=
                                    PROJECT_CONFIG.animation.ownerProjectsAt
                                  ? 'projects'
                                  : 'fly';
                        document.documentElement.dataset.photoOwner = owner;

                        if (
                            !terminalInteractivity &&
                            progress >=
                                PROJECT_CONFIG.animation.activationProgress
                        ) {
                            terminalInteractivity = true;
                            laptop.inert = false;
                            phone.inert = false;
                            controls.inert = false;
                        } else if (
                            terminalInteractivity &&
                            progress <
                                PROJECT_CONFIG.animation.deactivationProgress
                        ) {
                            terminalInteractivity = false;
                            laptop.inert = true;
                            phone.inert = true;
                            controls.inert = true;
                        }
                    };

                    const applyKeyboardAlignment = () => {
                        const laptopBottom = Number.parseFloat(
                            getComputedStyle(laptop).bottom,
                        );
                        const controlsY =
                            section.clientHeight -
                            (Number.isFinite(laptopBottom) ? laptopBottom : 0) -
                            laptop.offsetHeight *
                                (1 - PROJECT_CONFIG.desktop.keyboardCenterPct);
                        controls.style.setProperty(
                            '--project-controls-center-y',
                            `${controlsY}px`,
                        );
                    };

                    let flightTween: gsap.core.Tween | null = null;
                    if (photoPositions) {
                        const handoffStart = {
                            x: photoPositions.about.x,
                            y: photoPositions.about.y,
                        };
                        const flightProgress = { value: 0 };
                        const setFlightX = gsap.quickSetter(
                            photoFly,
                            'x',
                            'px',
                        );
                        const setFlightY = gsap.quickSetter(
                            photoFly,
                            'y',
                            'px',
                        );
                        const applyFlightPosition = (progress: number) => {
                            if (!photoPositions) return;
                            setFlightX(
                                handoffStart.x +
                                    (photoPositions.projects.x -
                                        handoffStart.x) *
                                        progress,
                            );
                            setFlightY(
                                handoffStart.y +
                                    (photoPositions.projects.y -
                                        handoffStart.y) *
                                        progress,
                            );
                        };
                        let capturedLiveStart = false;
                        const canCaptureLiveStart =
                            !window.location.hash.startsWith('#proyek') &&
                            window.scrollY <
                                section.getBoundingClientRect().top +
                                    window.scrollY -
                                    window.innerHeight;
                        gsap.set(photoFly, {
                            width: photoPositions.about.width,
                            height: photoPositions.about.height,
                            x: handoffStart.x,
                            y: handoffStart.y,
                            force3D: true,
                        });
                        flightTween = gsap.to(flightProgress, {
                            value: 1,
                            // This tween is scrubbed by scroll, so keep the path
                            // linear to avoid a visible pause at the handoff.
                            ease: 'none',
                            immediateRender: false,
                            onUpdate: () => {
                                applyFlightPosition(flightProgress.value);
                                updatePhotoOwner(flightTween?.progress() ?? 0);
                            },
                            scrollTrigger: {
                                id: 'projects-handoff',
                                trigger: section,
                                start: 'top bottom',
                                end: 'top top',
                                scrub: true,
                                invalidateOnRefresh: true,
                                refreshPriority: 1,
                                onEnter: (self) => {
                                    if (
                                        !canCaptureLiveStart ||
                                        capturedLiveStart ||
                                        !aboutPhoto
                                    ) {
                                        return;
                                    }
                                    const bounds =
                                        aboutPhoto.getBoundingClientRect();
                                    if (
                                        bounds.width <= 0 ||
                                        bounds.height <= 0
                                    ) {
                                        return;
                                    }
                                    handoffStart.x = bounds.left;
                                    handoffStart.y = bounds.top;
                                    gsap.set(photoFly, {
                                        width: bounds.width,
                                        height: bounds.height,
                                        x: bounds.left,
                                        y: bounds.top,
                                        force3D: true,
                                    });
                                    capturedLiveStart = true;
                                    flightTween?.progress(self.progress, true);
                                    applyFlightPosition(self.progress);
                                },
                                onRefresh: (self) => {
                                    photoPositions = applyPhotoGeometry();
                                    if (!photoPositions || !flightTween) {
                                        return;
                                    }
                                    gsap.set(photoFly, {
                                        width: photoPositions.about.width,
                                        height: photoPositions.about.height,
                                    });
                                    if (!capturedLiveStart) {
                                        handoffStart.x = photoPositions.about.x;
                                        handoffStart.y = photoPositions.about.y;
                                    }
                                    flightTween.invalidate();
                                    flightTween.progress(self.progress, true);
                                    applyFlightPosition(self.progress);
                                    updatePhotoOwner(flightTween.progress());
                                },
                                onToggle: () =>
                                    updatePhotoOwner(
                                        flightTween?.progress() ?? 0,
                                    ),
                            },
                        });
                    }

                    const projectsTl = gsap.timeline({
                        defaults: { ease: 'power2.out' },
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'top top',
                            scrub: isMobile
                                ? PROJECT_CONFIG.animation.mobileScrub
                                : PROJECT_CONFIG.animation.desktopScrub,
                            invalidateOnRefresh: true,
                            refreshPriority: -1,
                            onRefresh: applyKeyboardAlignment,
                        },
                    });
                    projectsTl.fromTo(
                        laptop,
                        {
                            autoAlpha: 0,
                            yPercent:
                                PROJECT_CONFIG.animation.laptopStartYPercent,
                            scale: PROJECT_CONFIG.animation.deviceStartScale,
                        },
                        {
                            autoAlpha: 1,
                            yPercent: 0,
                            scale: 1,
                            transformOrigin: '50% 100%',
                            duration:
                                PROJECT_CONFIG.desktop.endStagger.laptop -
                                PROJECT_CONFIG.desktop.startStagger.laptop,
                            immediateRender: false,
                        },
                        PROJECT_CONFIG.desktop.startStagger.laptop,
                    );
                    projectsTl.fromTo(
                        phone,
                        {
                            autoAlpha: 0,
                            yPercent:
                                PROJECT_CONFIG.animation.phoneStartYPercent,
                            scale: PROJECT_CONFIG.animation.deviceStartScale,
                        },
                        {
                            autoAlpha: 1,
                            yPercent: 0,
                            scale: 1,
                            duration:
                                PROJECT_CONFIG.desktop.endStagger.phone -
                                PROJECT_CONFIG.desktop.startStagger.phone,
                            immediateRender: false,
                        },
                        PROJECT_CONFIG.desktop.startStagger.phone,
                    );
                    projectsTl.fromTo(
                        title,
                        {
                            autoAlpha: 0,
                            x: PROJECT_CONFIG.animation.titleStartX,
                        },
                        {
                            autoAlpha: 1,
                            x: 0,
                            duration:
                                PROJECT_CONFIG.desktop.endStagger.title -
                                PROJECT_CONFIG.desktop.startStagger.title,
                            immediateRender: false,
                        },
                        PROJECT_CONFIG.desktop.startStagger.title,
                    );
                    projectsTl.fromTo(
                        controls,
                        {
                            autoAlpha: 0,
                            scale: PROJECT_CONFIG.animation.controlsStartScale,
                        },
                        {
                            autoAlpha: 1,
                            scale: 1,
                            duration:
                                PROJECT_CONFIG.desktop.endStagger.controls -
                                PROJECT_CONFIG.desktop.startStagger.controls,
                            immediateRender: false,
                        },
                        PROJECT_CONFIG.desktop.startStagger.controls,
                    );
                    projectsTl.fromTo(
                        counter,
                        { autoAlpha: 0 },
                        {
                            autoAlpha: 1,
                            duration:
                                PROJECT_CONFIG.desktop.endStagger.controls -
                                PROJECT_CONFIG.desktop.startStagger.controls,
                            immediateRender: false,
                        },
                        PROJECT_CONFIG.desktop.startStagger.controls,
                    );

                    ScrollTrigger.sort();
                    applyKeyboardAlignment();
                };

                media.add(
                    {
                        isMobile: `(max-width: ${PROJECT_CONFIG.mobile.breakpoint - 1}px)`,
                        isDesktop: `(min-width: ${PROJECT_CONFIG.mobile.breakpoint}px)`,
                        reduceMotion:
                            PROJECT_CONFIG.animation.reducedMotionQuery,
                    },
                    () => {
                        create();

                        return () => {
                            laptop.inert = true;
                            phone.inert = true;
                            controls.inert = true;
                        };
                    },
                );
            };

            const startWhenReady = () => {
                if (cancelled) return;
                if (
                    !ScrollTrigger.getById('about-scene') ||
                    !photoFlyRef.current
                ) {
                    setupFrame = requestAnimationFrame(startWhenReady);
                    return;
                }
                void initialize();
            };
            setupFrame = requestAnimationFrame(startWhenReady);

            return () => {
                cancelled = true;
                cancelAnimationFrame(setupFrame);
                media.revert();
                section.removeAttribute('data-motion');
            };
        },
        { scope: sectionRef, dependencies: [portalTarget] },
    );

    useEffect(() => {
        const viewports = viewportRefs.current.filter(
            (viewport): viewport is HTMLDivElement => viewport !== null,
        );
        if (viewports.length < 2) return;

        const resizeObserver = new ResizeObserver(() => {
            viewports.forEach((viewport, index) => {
                viewportHeightsRef.current[index] = viewport.clientHeight;
            });
        });
        viewports.forEach((viewport, index) => {
            viewportHeightsRef.current[index] = viewport.clientHeight;
            resizeObserver.observe(viewport);
        });

        const listeners = viewports.map((viewport, viewportIndex) => {
            const onScroll = () => {
                const viewportHeight =
                    viewportHeightsRef.current[viewportIndex];
                if (
                    syncingScrollRef.current ||
                    programmaticSwitchRef.current ||
                    !viewportHeight
                ) {
                    return;
                }

                const nextIndex = Math.max(
                    0,
                    Math.min(
                        projects.length - 1,
                        Math.round(viewport.scrollTop / viewportHeight),
                    ),
                );
                setCurrentIndex(nextIndex);
                syncingScrollRef.current = true;
                viewports.forEach((otherViewport, otherIndex) => {
                    if (otherViewport !== viewport) {
                        otherViewport.scrollTop =
                            nextIndex *
                            (viewportHeightsRef.current[otherIndex] ?? 0);
                    }
                });
                requestAnimationFrame(() => {
                    syncingScrollRef.current = false;
                });
            };

            viewport.addEventListener('scroll', onScroll, { passive: true });
            return () => viewport.removeEventListener('scroll', onScroll);
        });

        return () => {
            resizeObserver.disconnect();
            switchTimelineRef.current?.kill();
            switchTimelineRef.current = null;
            listeners.forEach((removeListener) => removeListener());
        };
    }, [setCurrentIndex]);

    useGSAP(
        () => {
            if (activeIndex === previousCounterRef.current) return;
            const previous = counterPreviousRef.current;
            const current = counterCurrentRef.current;
            if (!previous || !current) return;

            gsap.killTweensOf([previous, current]);
            previous.textContent = `${String(previousCounterRef.current + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
            current.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
            gsap.timeline({ defaults: { ease: 'power2.out' } })
                .fromTo(
                    previous,
                    { yPercent: 0, autoAlpha: 1 },
                    {
                        yPercent: -100,
                        autoAlpha: 0,
                        duration: window.matchMedia(
                            PROJECT_CONFIG.animation.reducedMotionQuery,
                        ).matches
                            ? 0
                            : PROJECT_CONFIG.animation.counterDuration,
                    },
                    0,
                )
                .fromTo(
                    current,
                    { yPercent: 100, autoAlpha: 0 },
                    {
                        yPercent: 0,
                        autoAlpha: 1,
                        duration: window.matchMedia(
                            PROJECT_CONFIG.animation.reducedMotionQuery,
                        ).matches
                            ? 0
                            : PROJECT_CONFIG.animation.counterDuration,
                    },
                    0,
                );
            previousCounterRef.current = activeIndex;
        },
        {
            scope: sectionRef,
            dependencies: [activeIndex],
            revertOnUpdate: false,
        },
    );

    const moveProject = useCallback(
        (direction: -1 | 1) => {
            const nextIndex = Math.max(
                0,
                Math.min(
                    projects.length - 1,
                    activeIndexRef.current + direction,
                ),
            );
            if (nextIndex === activeIndexRef.current) return;

            const viewports = viewportRefs.current.filter(
                (viewport): viewport is HTMLDivElement => viewport !== null,
            );
            const reducedMotion = window.matchMedia(
                PROJECT_CONFIG.animation.reducedMotionQuery,
            ).matches;
            setCurrentIndex(nextIndex);
            programmaticSwitchRef.current = true;

            switchTimelineRef.current?.kill();
            const switchTimeline = gsap.timeline({
                defaults: { overwrite: true },
                onComplete: () => {
                    programmaticSwitchRef.current = false;
                    switchTimelineRef.current = null;
                },
            });
            switchTimelineRef.current = switchTimeline;
            viewports.forEach((viewport) => {
                const viewportIndex = viewportRefs.current.indexOf(viewport);
                const viewportHeight =
                    viewportHeightsRef.current[viewportIndex];
                switchTimeline.to(
                    viewport,
                    {
                        scrollTo: {
                            y:
                                nextIndex *
                                (viewportHeight || viewport.clientHeight),
                            autoKill: false,
                        },
                        duration: reducedMotion
                            ? 0
                            : PROJECT_CONFIG.animation.switchDuration,
                        ease: 'power3.inOut',
                    },
                    0,
                );
            });
        },
        [setCurrentIndex],
    );

    const activeProject = projects[activeIndex];

    const renderDevice = (device: Device, index: number) => (
        <div
            ref={device === 'laptop' ? laptopRef : phoneRef}
            className={`project-device project-device--${device}`}
            key={device}
        >
            <div
                ref={(element) => {
                    viewportRefs.current[index] = element;
                }}
                className={`project-device-screen project-device-screen--${device}`}
                role="region"
                aria-label={`${t('projectShowcase')} ${t(device === 'laptop' ? 'laptopView' : 'mobileView')}`}
            >
                <div className="project-laptop-track">
                    {projects.map((project, projectIndex) => (
                        <ProjectScreen
                            key={project.id}
                            project={project}
                            index={projectIndex}
                            language={language}
                            active={projectIndex === activeIndex}
                        />
                    ))}
                </div>
            </div>
            <img
                className="project-device-frame"
                src={`/images/${device}.webp`}
                alt=""
                aria-hidden="true"
                width={
                    device === 'laptop'
                        ? PROJECT_CONFIG.frameNaturalSize.laptop.width
                        : PROJECT_CONFIG.frameNaturalSize.phone.width
                }
                height={
                    device === 'laptop'
                        ? PROJECT_CONFIG.frameNaturalSize.laptop.height
                        : PROJECT_CONFIG.frameNaturalSize.phone.height
                }
                loading="lazy"
                decoding="async"
                draggable={false}
            />
            {activeProject?.liveDemoUrl && (
                <a
                    className="project-device-demo-link"
                    href={activeProject.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${t('viewLiveDemo')}: ${language === 'id' ? activeProject.titleId : activeProject.titleEn}`}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M14 3h7v7M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                </a>
            )}
        </div>
    );

    return (
        <section
            ref={sectionRef}
            id="proyek"
            aria-labelledby="project-showcase-title"
            className="project-showcase"
            style={desktopStyle}
        >
            <div className="project-photo-clip" aria-hidden="true">
                <div ref={photoRef} className="project-photo">
                    <img
                        src={PROJECT_CONFIG.photoFiles.light}
                        alt=""
                        width={853}
                        height={1844}
                        loading="eager"
                        decoding="async"
                        draggable={false}
                        className="project-photo-light"
                    />
                    <img
                        src={PROJECT_CONFIG.photoFiles.dark}
                        alt=""
                        width={853}
                        height={1844}
                        loading="eager"
                        decoding="async"
                        draggable={false}
                        className="project-photo-dark"
                    />
                </div>
            </div>
            <div className="project-showcase-stage">
                <h2
                    ref={titleRef}
                    id="project-showcase-title"
                    className="project-showcase-title"
                >
                    {t('projects')}
                </h2>
                <p className="project-showcase-hint">{t('scrollProjects')}</p>
                {renderDevice('laptop', 0)}
                {renderDevice('mobile', 1)}
                <div ref={controlsRef} className="project-showcase-controls">
                    <button
                        type="button"
                        aria-label={t('previousProject')}
                        onClick={() => moveProject(-1)}
                        disabled={activeIndex === 0}
                    >
                        <svg
                            className="project-arrow-icon project-arrow-icon--left"
                            width="169"
                            height="99"
                            viewBox="0 0 169 99"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M161.5 44.9615C164.833 46.886 164.833 51.6973 161.5 53.6218L102.563 87.6494C99.2292 89.5739 95.0625 87.1683 95.0625 83.3193V15.2641C95.0625 11.4151 99.2292 9.00946 102.563 10.934L161.5 44.9615Z"
                                fill="currentColor"
                            />
                            <rect
                                x="101.144"
                                y="26.2462"
                                width="45.4508"
                                height="101.144"
                                rx="5"
                                transform="rotate(90 101.144 26.2462)"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <div className="project-showcase-counter-clip">
                        <p
                            ref={counterRef}
                            className="project-showcase-counter"
                            aria-live="off"
                        >
                            <span
                                ref={counterPreviousRef}
                                className="project-showcase-counter-previous"
                                aria-hidden="true"
                            >
                                01 / {String(projects.length).padStart(2, '0')}
                            </span>
                            <span
                                ref={counterCurrentRef}
                                aria-live="polite"
                                className="project-showcase-counter-current"
                            >
                                01 / {String(projects.length).padStart(2, '0')}
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label={t('nextProject')}
                        onClick={() => moveProject(1)}
                        disabled={activeIndex === projects.length - 1}
                    >
                        <svg
                            className="project-arrow-icon"
                            width="169"
                            height="99"
                            viewBox="0 0 169 99"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                d="M161.5 44.9615C164.833 46.886 164.833 51.6973 161.5 53.6218L102.563 87.6494C99.2292 89.5739 95.0625 87.1683 95.0625 83.3193V15.2641C95.0625 11.4151 99.2292 9.00946 102.563 10.934L161.5 44.9615Z"
                                fill="currentColor"
                            />
                            <rect
                                x="101.144"
                                y="26.2462"
                                width="45.4508"
                                height="101.144"
                                rx="5"
                                transform="rotate(90 101.144 26.2462)"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            {portalTarget &&
                createPortal(
                    <div
                        ref={photoFlyRef}
                        className="project-photo-fly"
                        aria-hidden="true"
                    >
                        <img
                            src={PROJECT_CONFIG.photoFiles.light}
                            alt=""
                            width={853}
                            height={1844}
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            className="project-photo-image project-photo-light"
                        />
                        <img
                            src={PROJECT_CONFIG.photoFiles.dark}
                            alt=""
                            aria-hidden="true"
                            width={853}
                            height={1844}
                            loading="eager"
                            decoding="async"
                            draggable={false}
                            className="project-photo-image project-photo-dark"
                        />
                    </div>,
                    portalTarget,
                )}
        </section>
    );
}
