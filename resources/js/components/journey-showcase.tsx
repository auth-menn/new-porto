import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '@/lib/i18n';
import { JOURNEY_CONFIG } from '@/data/journey-config';
import type { Journey } from '@/types';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type JourneyCardItem = {
    id: number;
    number: string;
    category: Journey['category'];
    period: string;
    organization: string;
    role: string;
    activities: string[];
    logoSrc: string | null;
    documentationSrc: string | null;
};

const fragmentRows = 3;
const fragmentColumns = 5;
const journeyFragments = Array.from(
    { length: fragmentRows * fragmentColumns },
    (_, index) => ({
        key: index,
        row: Math.floor(index / fragmentColumns),
        column: index % fragmentColumns,
    }),
);

export function JourneyShowcase({ journeys }: { journeys: Journey[] }) {
    const sectionRef = useRef<HTMLElement>(null);
    const { t } = useLang();
    const journeyItems: JourneyCardItem[] = journeys.map((journey, index) => ({
        id: journey.id,
        number: String(index + 1).padStart(2, '0'),
        category: journey.category,
        period: `${journey.startYear} — ${journey.endYear ?? t('journeyCurrent')}`,
        organization: journey.organization,
        role: journey.title,
        activities: journey.activities,
        logoSrc: journey.logoUrl,
        documentationSrc: journey.documentationUrl,
    }));

    useGSAP(
        () => {
            const media = gsap.matchMedia();

            media.add(
                {
                    motion: '(prefers-reduced-motion: no-preference)',
                    desktop: '(min-width: 768px)',
                    mobile: '(max-width: 767px)',
                },
                (context) => {
                    const section = sectionRef.current;
                    if (!section || !context.conditions?.motion) return;

                    const entries = gsap.utils.toArray<HTMLElement>(
                        '[data-journey-entry]',
                        section,
                    );
                    const viewport = section.querySelector<HTMLElement>(
                        '[data-journey-viewport]',
                    );

                    if (!viewport || entries.length === 0) return;

                    section.dataset.horizontal = 'true';
                    const config = context.conditions.mobile
                        ? JOURNEY_CONFIG.mobile
                        : JOURNEY_CONFIG.desktop;
                    const firstContent = entries[0].querySelector<HTMLElement>(
                        '[data-journey-content]',
                    );

                    if (!firstContent) return;

                    const measure = () => {
                        const viewportRect = viewport.getBoundingClientRect();
                        const slotRect = firstContent.getBoundingClientRect();
                        const firstX =
                            Number(gsap.getProperty(entries[0], 'x')) || 0;
                        const firstY =
                            Number(gsap.getProperty(entries[0], 'y')) || 0;
                        const width = viewport.clientWidth;
                        const height = viewport.clientHeight;
                        const left = slotRect.left - viewportRect.left - firstX;
                        const top = slotRect.top - viewportRect.top - firstY;

                        return {
                            slot: { x: 0, y: 0 },
                            peek: {
                                x: width * (1 - config.peekVisibleWPct) - left,
                                y: height * (1 - config.peekVisibleHPct) - top,
                            },
                            offscreen: {
                                x: width - left + 48,
                                y: height - top + 48,
                            },
                            exit: {
                                x: -(left + slotRect.width + 48),
                                y: -slotRect.height * config.exitUpPct,
                            },
                            width,
                            height,
                        };
                    };

                    let timeline: gsap.core.Timeline | null = null;
                    const setInitialPositions = () => {
                        entries.forEach((entry, index) => {
                            const positions = measure();
                            const start =
                                index === 0
                                    ? positions.slot
                                    : index === 1
                                      ? positions.peek
                                      : positions.offscreen;

                            gsap.set(entry, {
                                x: () => start.x,
                                y: () => start.y,
                                autoAlpha: 1,
                                zIndex: index + 1,
                            });
                            gsap.set(
                                entry.querySelectorAll(
                                    '[data-journey-content]',
                                ),
                                { autoAlpha: 1 },
                            );
                            gsap.set(
                                entry.querySelectorAll(
                                    '[data-journey-fragment]',
                                ),
                                { autoAlpha: 0, clearProps: 'x,y' },
                            );
                        });
                    };

                    setInitialPositions();

                    section.dataset.journeyReady = 'true';

                    timeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: section,
                            start: 'top top',
                            end: () =>
                                `+=${(entries.length - 1) * config.stepVh + JOURNEY_CONFIG.timing.holdEnd * config.stepVh}vh`,
                            pin: true,
                            scrub: JOURNEY_CONFIG.timing.scrub,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            onRefresh: () => {
                                if (timeline?.progress() === 0) {
                                    setInitialPositions();
                                }
                            },
                        },
                    });

                    timeline.to(
                        {},
                        { duration: JOURNEY_CONFIG.timing.holdStart },
                    );

                    for (
                        let index = 0;
                        index < entries.length - 1;
                        index += 1
                    ) {
                        const transitionStart =
                            JOURNEY_CONFIG.timing.holdStart +
                            index *
                                (JOURNEY_CONFIG.timing.transition +
                                    JOURNEY_CONFIG.timing.holdBetween);
                        const outgoing = entries[index];
                        const incoming = entries[index + 1];
                        const outgoingContent =
                            outgoing.querySelector<HTMLElement>(
                                '[data-journey-content]',
                            );
                        const outgoingFragments =
                            gsap.utils.toArray<HTMLElement>(
                                '[data-journey-fragment]',
                                outgoing,
                            );

                        if (
                            !outgoingContent ||
                            outgoingFragments.length === 0
                        ) {
                            continue;
                        }

                        timeline.fromTo(
                            outgoing,
                            {
                                x: () => measure().slot.x,
                                y: () => measure().slot.y,
                                immediateRender: false,
                            },
                            {
                                x: () => measure().exit.x,
                                y: () => measure().exit.y,
                                duration: JOURNEY_CONFIG.timing.transition,
                                ease: JOURNEY_CONFIG.ease,
                                immediateRender: false,
                            },
                            transitionStart,
                        );

                        timeline.fromTo(
                            incoming,
                            {
                                x: () => measure().peek.x,
                                y: () => measure().peek.y,
                                immediateRender: false,
                            },
                            {
                                x: () => measure().slot.x,
                                y: () => measure().slot.y,
                                duration: JOURNEY_CONFIG.timing.transition,
                                ease: JOURNEY_CONFIG.ease,
                                immediateRender: false,
                            },
                            transitionStart,
                        );

                        const preloaded = entries[index + 2];

                        if (preloaded) {
                            timeline.fromTo(
                                preloaded,
                                {
                                    x: () => measure().offscreen.x,
                                    y: () => measure().offscreen.y,
                                    immediateRender: false,
                                },
                                {
                                    x: () => measure().peek.x,
                                    y: () => measure().peek.y,
                                    duration: JOURNEY_CONFIG.timing.transition,
                                    ease: JOURNEY_CONFIG.ease,
                                    immediateRender: false,
                                },
                                transitionStart +
                                    JOURNEY_CONFIG.timing.peekStagger,
                            );
                        }

                        timeline.fromTo(
                            outgoingContent,
                            { autoAlpha: 1, immediateRender: false },
                            {
                                autoAlpha: 0,
                                duration:
                                    JOURNEY_CONFIG.timing.transition * 0.3,
                                ease: 'none',
                                immediateRender: false,
                            },
                            transitionStart +
                                JOURNEY_CONFIG.timing.transition * 0.65,
                        );
                        timeline.fromTo(
                            outgoingFragments,
                            { autoAlpha: 0, immediateRender: false },
                            {
                                autoAlpha: 1,
                                duration:
                                    JOURNEY_CONFIG.timing.transition * 0.04,
                                ease: 'none',
                                immediateRender: false,
                            },
                            transitionStart +
                                JOURNEY_CONFIG.timing.transition * 0.65,
                        );
                        timeline.fromTo(
                            outgoingFragments,
                            {
                                x: 0,
                                y: 0,
                                autoAlpha: 1,
                                immediateRender: false,
                            },
                            {
                                x: () =>
                                    gsap.utils.random(
                                        -measure().width * 0.14,
                                        -measure().width * 0.04,
                                    ),
                                y: () =>
                                    gsap.utils.random(
                                        -measure().height * 0.18,
                                        -measure().height * 0.05,
                                    ),
                                autoAlpha: 0,
                                stagger: { each: 0.003, from: 'random' },
                                duration:
                                    JOURNEY_CONFIG.timing.transition * 0.32,
                                ease: 'none',
                                immediateRender: false,
                            },
                            transitionStart +
                                JOURNEY_CONFIG.timing.transition * 0.68,
                        );
                    }

                    const lastTransitionStart =
                        JOURNEY_CONFIG.timing.holdStart +
                        (entries.length - 2) *
                            (JOURNEY_CONFIG.timing.transition +
                                JOURNEY_CONFIG.timing.holdBetween);
                    timeline.to(
                        {},
                        { duration: JOURNEY_CONFIG.timing.holdEnd },
                        lastTransitionStart + JOURNEY_CONFIG.timing.transition,
                    );

                    return () => {
                        delete section.dataset.horizontal;
                        section.dataset.journeyReady = 'false';
                    };
                },
            );

            media.add('(prefers-reduced-motion: reduce)', () => {
                const section = sectionRef.current;
                if (!section) return;

                section.dataset.journeyReady = 'true';
                gsap.set(section.querySelectorAll('[data-journey-fragment]'), {
                    autoAlpha: 0,
                    clearProps: 'x,y',
                });
            });

            return () => media.revert();
        },
        { scope: sectionRef, dependencies: [journeys.length] },
    );

    const renderEntryContent = (item: JourneyCardItem) => (
        <div className="journey-entry-face">
            <div className="journey-entry-header">
                <div className="journey-entry-identity">
                    {item.logoSrc ? (
                        <img
                            className="journey-entry-logo"
                            src={item.logoSrc}
                            alt={`${item.organization} — ${t('journeyOrganizationLogo')}`}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div
                            className="journey-entry-logo-placeholder"
                            aria-hidden="true"
                        >
                            {item.number}
                        </div>
                    )}
                    <div className="journey-entry-heading">
                        <span className="journey-entry-category">
                            {t(item.category)}
                        </span>
                        <p className="journey-entry-organization">
                            {item.organization}
                        </p>
                        <h3>{item.role}</h3>
                    </div>
                </div>
                <p className="journey-entry-period">{item.period}</p>
            </div>
            <div className="journey-entry-body">
                <ul className="journey-entry-activities">
                    {item.activities.map((activity) => (
                        <li key={activity}>{activity}</li>
                    ))}
                </ul>
                <div className="journey-entry-documentation">
                    {item.documentationSrc ? (
                        <img
                            src={item.documentationSrc}
                            alt={`${t('journeyDocumentation')} — ${item.role}`}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div
                            className="journey-entry-documentation-placeholder"
                            aria-hidden="true"
                        >
                            <span>{t('journeyDocumentation')}</span>
                            <span>{item.number}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (journeyItems.length === 0) {
        return null;
    }

    return (
        <section
            ref={sectionRef}
            id="perjalanan"
            className="journey-section"
            data-journey-ready="false"
            aria-labelledby="journey-title"
        >
            <div className="journey-section-heading">
                <h2 id="journey-title">{t('journey')}</h2>
                <p>{t('journeyDescription')}</p>
            </div>

            <div className="journey-horizontal-viewport" data-journey-viewport>
                <div className="journey-list">
                    {journeyItems.map((item) => (
                        <article
                            key={item.id}
                            className="journey-entry"
                            data-journey-entry
                            aria-label={`${t(item.category)} ${item.number}`}
                        >
                            <div
                                className="journey-entry-content"
                                data-journey-content
                            >
                                {renderEntryContent(item)}
                            </div>
                            <div
                                className="journey-entry-fragments"
                                aria-hidden="true"
                            >
                                {journeyFragments.map((fragment) => (
                                    <div
                                        key={fragment.key}
                                        className="journey-entry-fragment"
                                        data-journey-fragment
                                        style={{
                                            clipPath: `inset(${(fragment.row / fragmentRows) * 100}% ${(1 - (fragment.column + 1) / fragmentColumns) * 100}% ${(1 - (fragment.row + 1) / fragmentRows) * 100}% ${(fragment.column / fragmentColumns) * 100}%)`,
                                        }}
                                    >
                                        {renderEntryContent(item)}
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
