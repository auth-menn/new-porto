import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useLang } from '@/lib/i18n';
import type { Project } from '@/types';

type ProjectSummaryProps = {
    projects: Project[];
    heroReady: boolean;
    heroEntered: boolean;
    reducedMotion: boolean;
    onEntranceComplete: () => void;
    showHeader?: boolean;
};

const PILE_DEPTH = 3;
function ProjectCard({
    project,
    index,
    setCardRef,
    setImageRef,
    onImageAspectChange,
    active,
    visible,
}: {
    project: Project;
    index: number;
    setCardRef: (index: number, element: HTMLElement | null) => void;
    setImageRef: (index: number, element: HTMLDivElement | null) => void;
    onImageAspectChange: (index: number, aspectRatio: number) => void;
    active: boolean;
    visible: boolean;
}) {
    const [imageMissing, setImageMissing] = useState(false);
    const title = project.title;

    return (
        <article
            ref={(element) => setCardRef(index, element)}
            data-project-index={index}
            aria-hidden={!visible}
            inert={!active || !visible}
            className="project-card group"
        >
            <div className="project-card-image-wrap">
                <div
                    ref={(element) => setImageRef(index, element)}
                    className="project-card-image-visual"
                >
                    {!imageMissing ? (
                        <picture className="block h-full w-full">
                            <source media="(max-width: 767px)" srcSet={project.mobileImageUrl} />
                            <img
                                src={project.laptopImageUrl}
                                alt={title}
                                width="960"
                                height="600"
                                loading={index === 0 ? 'eager' : 'lazy'}
                                fetchPriority={index === 0 ? 'high' : undefined}
                                decoding="async"
                                onLoad={(event) => {
                                    const { naturalWidth, naturalHeight } = event.currentTarget;
                                    if (naturalHeight > 0) {
                                        onImageAspectChange(index, naturalWidth / naturalHeight);
                                    }
                                }}
                                onError={() => setImageMissing(true)}
                                className="project-card-image"
                            />
                        </picture>
                    ) : (
                        <div
                            aria-hidden="true"
                            className="project-card-image project-card-image-empty"
                        />
                    )}
                </div>
            </div>

            <Link
                href="/#proyek"
                aria-label={title}
                data-title={title}
                tabIndex={active && visible ? 0 : -1}
                className="project-card-link after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-fg)]"
            />
        </article>
    );
}

export function ProjectSummary({
    projects,
    heroReady,
    heroEntered,
    reducedMotion,
    onEntranceComplete,
    showHeader = true,
}: ProjectSummaryProps) {
    const { t } = useLang();
    const projectCount = Math.max(projects.length, 1);
    const sectionRef = useRef<HTMLElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Array<HTMLElement | null>>([]);
    const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
    const setCardAspectRatio = (index: number, aspectRatio: number) => {
        cardRefs.current[index]?.style.setProperty(
            '--project-card-aspect',
            `${aspectRatio}`,
        );
    };
    const metricsRef = useRef({
        step: 1,
        cardHeight: 1,
        peek: 22,
        documentTop: 0,
        stickyTop: 0,
    });
    const [flowLayout, setFlowLayout] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const updateLayout = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const left = Math.max(width * 0.66, width * 0.52 + height * 0.212);
            const availableWidth = width * 0.94 - left;

            setFlowLayout(width < 768 || availableWidth < 300);
        };

        updateLayout();
        window.addEventListener('resize', updateLayout, { passive: true });

        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        const viewport = viewportRef.current;
        const track = trackRef.current;
        const stage = stageRef.current;

        if (!section || !viewport || !track || !stage) {
            return;
        }

        const measure = () => {
            const sectionBounds = section.getBoundingClientRect();
            const card = cardRefs.current[0];
            const cardBounds = card?.getBoundingClientRect();

            metricsRef.current = {
                step: Math.max(1, (cardBounds?.height ?? 1) * 0.55),
                cardHeight: Math.max(1, cardBounds?.height ?? 1),
                peek: flowLayout ? 16 : 22,
                documentTop: sectionBounds.top + window.scrollY,
                stickyTop: flowLayout
                    ? Math.max(68, window.innerHeight * 0.069)
                    : 0,
            };
        };

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(section);
        resizeObserver.observe(viewport);
        resizeObserver.observe(track);
        resizeObserver.observe(stage);
        cardRefs.current.forEach((card) => {
            if (card) {
                resizeObserver.observe(card);
            }
        });
        measure();

        let animationFrame = 0;
        const updateDeck = () => {
            if (animationFrame) {
                return;
            }

            animationFrame = requestAnimationFrame(() => {
                animationFrame = 0;
                const metrics = metricsRef.current;
                const rawProgress = flowLayout
                    ? (window.scrollY -
                          metrics.documentTop +
                          metrics.stickyTop) /
                      metrics.step
                    : viewport.scrollTop / metrics.step;
                const progress = Math.min(
                    projectCount - 1,
                    Math.max(0, rawProgress),
                );
                const nearestIndex = Math.min(
                    projectCount - 1,
                    Math.max(0, Math.round(progress)),
                );
                const outgoingIndex = Math.floor(progress);
                const transitionProgress = progress - outgoingIndex;
                const lift =
                    Math.sin(Math.PI * transitionProgress) *
                    metrics.cardHeight *
                    0.18;

                cardRefs.current.forEach((card, index) => {
                    const image = imageRefs.current[index];

                    if (!card || !image) {
                        return;
                    }

                    const delta = index - progress;
                    const distance = Math.abs(delta);
                    const isVisible = distance <= PILE_DEPTH;
                    const isActive = index === nearestIndex;
                    const outgoingLift = index === outgoingIndex ? lift : 0;
                    const scale = Math.max(0.8, 1 - distance * 0.05);
                    const y = delta * metrics.peek - outgoingLift;
                    let imageOpacity = isActive ? 1 : 0.55;

                    if (index === outgoingIndex) {
                        imageOpacity =
                            1 -
                            transitionProgress * 0.45 -
                            Math.sin(Math.PI * transitionProgress) * 0.15;
                    } else if (index === outgoingIndex + 1) {
                        imageOpacity = 0.55 + transitionProgress * 0.45;
                    }

                    card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
                    card.style.zIndex = `${100 - Math.round(distance * 10) + (isActive ? 100 : 0)}`;
                    card.style.visibility = isVisible ? 'visible' : 'hidden';
                    image.style.opacity = `${imageOpacity}`;
                });

                setActiveIndex((current) =>
                    current === nearestIndex ? current : nearestIndex,
                );
            });
        };

        const onKeyDown = (event: KeyboardEvent) => {
            const keyDirections: Record<string, number> = {
                ArrowDown: 1,
                PageDown: 1,
                ArrowUp: -1,
                PageUp: -1,
            };
            const direction = keyDirections[event.key];

            if (direction !== undefined) {
                event.preventDefault();
                const scrollTarget = flowLayout ? window : viewport;
                const currentScroll = flowLayout
                    ? window.scrollY
                    : viewport.scrollTop;

                scrollTarget.scrollTo({
                    top: currentScroll + direction * metricsRef.current.step,
                    behavior: reducedMotion ? 'instant' : 'smooth',
                });
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                const scrollTarget = flowLayout ? window : viewport;
                const firstPosition = flowLayout
                    ? metricsRef.current.documentTop -
                      metricsRef.current.stickyTop
                    : 0;
                const lastPosition = flowLayout
                    ? firstPosition +
                      metricsRef.current.step * (projectCount - 1)
                    : viewport.scrollHeight;

                scrollTarget.scrollTo({
                    top: event.key === 'Home' ? firstPosition : lastPosition,
                    behavior: reducedMotion ? 'instant' : 'smooth',
                });
            }
        };

        const scrollTarget: HTMLElement | Window = flowLayout
            ? window
            : viewport;
        scrollTarget.addEventListener('scroll', updateDeck, { passive: true });
        viewport.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', measure, { passive: true });
        updateDeck();

        return () => {
            resizeObserver.disconnect();
            scrollTarget.removeEventListener('scroll', updateDeck);
            viewport.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', measure);
            cancelAnimationFrame(animationFrame);
        };
    }, [flowLayout, projectCount, reducedMotion]);

    const onEntranceEnd = (event: React.AnimationEvent<HTMLElement>) => {
        if (event.target === event.currentTarget) {
            event.currentTarget.style.removeProperty('will-change');
            onEntranceComplete();
        }
    };

    if (projects.length === 0) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            id={flowLayout ? 'proyek-ringkas' : undefined}
            data-layout={flowLayout ? 'flow' : 'overlay'}
            data-hero-ready={heroReady}
            data-hero-entered={heroEntered}
            aria-label={t('projectSummary')}
            className="project-summary"
        >
            <div
                className="project-summary-entrance"
                onAnimationEnd={onEntranceEnd}
                style={
                    heroReady && !reducedMotion
                        ? { willChange: 'transform, opacity' }
                        : undefined
                }
            >
                {showHeader && (
                    <div className="project-summary-label font-michroma">
                        <span>{t('projects')}</span>
                        <span aria-live="off">
                            {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                        </span>
                    </div>
                )}

                <div
                    ref={viewportRef}
                    role="region"
                    aria-label={t('projectSummary')}
                    tabIndex={0}
                    data-lenis-prevent={!flowLayout || undefined}
                    className="project-summary-viewport"
                >
                    <div ref={trackRef} className="project-summary-track">
                        <div ref={stageRef} className="project-summary-stage">
                            {projects.map((project, index) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    index={index}
                                    active={index === activeIndex}
                                    visible={
                                        Math.abs(index - activeIndex) <=
                                        PILE_DEPTH
                                    }
                                    setCardRef={(cardIndex, element) => {
                                        cardRefs.current[cardIndex] = element;
                                    }}
                                    setImageRef={(cardIndex, element) => {
                                        imageRefs.current[cardIndex] = element;
                                    }}
                                    onImageAspectChange={setCardAspectRatio}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
