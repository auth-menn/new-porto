import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const journeyItems = [
    {
        number: '01',
        category: 'education',
        period: 'journeyPeriodPlaceholder',
        title: 'educationTitlePlaceholder',
        detail: 'educationDetailPlaceholder',
    },
    {
        number: '02',
        category: 'internship',
        period: 'journeyPeriodPlaceholder',
        title: 'internshipTitlePlaceholder',
        detail: 'companyPlaceholder',
    },
    {
        number: '03',
        category: 'workExperience',
        period: 'journeyPeriodPlaceholder',
        title: 'workTitlePlaceholder',
        detail: 'companyPlaceholder',
    },
] as const;

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

export function JourneyShowcase() {
    const sectionRef = useRef<HTMLElement>(null);
    const { t } = useLang();

    useGSAP(
        () => {
            const media = gsap.matchMedia();

            media.add('(prefers-reduced-motion: no-preference)', () => {
                const section = sectionRef.current;
                if (!section) return;

                const entries = gsap.utils.toArray<HTMLElement>(
                    '[data-journey-entry]',
                    section,
                );

                const viewport = section.querySelector<HTMLElement>(
                    '[data-journey-viewport]',
                );
                const track = section.querySelector<HTMLElement>(
                    '[data-journey-track]',
                );

                if (!viewport || !track || entries.length === 0) return;

                section.dataset.horizontal = 'true';
                const travelSegments = entries.length + 1;
                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: () =>
                            `+=${track.scrollWidth - viewport.clientWidth}`,
                        pin: true,
                        scrub: 0.8,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });

                timeline.to(
                    track,
                    {
                        x: () => -(track.scrollWidth - viewport.clientWidth),
                        duration: travelSegments,
                        ease: 'none',
                    },
                    0,
                );

                entries.forEach((entry, index) => {
                    const segmentDuration = travelSegments / entries.length;
                    const segmentStart = index * segmentDuration;
                    const content = entry.querySelector<HTMLElement>(
                        '[data-journey-content]',
                    );
                    const fragments = gsap.utils.toArray<HTMLElement>(
                        '[data-journey-fragment]',
                        entry,
                    );

                    if (!content || fragments.length === 0) return;

                    gsap.set(content, { autoAlpha: 0, x: '14vw', y: '12vh' });
                    gsap.set(fragments, { autoAlpha: 0 });

                    timeline.to(
                        content,
                        {
                            autoAlpha: 1,
                            x: 0,
                            y: 0,
                            duration: 0.2,
                            ease: 'none',
                        },
                        segmentStart + segmentDuration * 0.05,
                    );
                    timeline.to(
                        fragments,
                        {
                            autoAlpha: 1,
                            duration: 0.04,
                            ease: 'none',
                        },
                        segmentStart + segmentDuration * 0.65,
                    );
                    timeline.to(
                        content,
                        {
                            autoAlpha: 0,
                            x: '-12vw',
                            y: '-8vh',
                            duration: 0.13,
                            ease: 'none',
                        },
                        segmentStart + segmentDuration * 0.7,
                    );
                    timeline.to(
                        fragments,
                        {
                            x: () => gsap.utils.random(-180, -40),
                            y: () => gsap.utils.random(-80, 100),
                            rotation: () => gsap.utils.random(-18, 18),
                            autoAlpha: 0,
                            stagger: { each: 0.003, from: 'random' },
                            duration: 0.32,
                            ease: 'none',
                        },
                        segmentStart + segmentDuration * 0.7,
                    );
                });

                return () => {
                    delete section.dataset.horizontal;
                };
            });

            media.add('(prefers-reduced-motion: reduce)', () => {
                const section = sectionRef.current;
                if (!section) return;

                gsap.set(section.querySelectorAll('[data-journey-content]'), {
                    autoAlpha: 1,
                    clearProps: 'transform',
                });
                gsap.set(section.querySelectorAll('[data-journey-fragment]'), {
                    autoAlpha: 0,
                });
            });

            return () => media.revert();
        },
        { scope: sectionRef, dependencies: [] },
    );

    const renderEntryContent = (item: (typeof journeyItems)[number]) => (
        <div className="journey-entry-face">
            <div className="journey-entry-meta">
                <span>{item.number}</span>
                <span>{t(item.category)}</span>
            </div>
            <p className="journey-entry-period">{t(item.period)}</p>
            <h3>{t(item.title)}</h3>
            <p className="journey-entry-detail">{t(item.detail)}</p>
        </div>
    );

    return (
        <section
            ref={sectionRef}
            id="perjalanan"
            className="journey-section"
            aria-labelledby="journey-title"
        >
            <div className="journey-section-heading">
                <p className="journey-section-kicker">03 / {t('journey')}</p>
                <h2 id="journey-title">{t('journey')}</h2>
                <p>{t('journeyDescription')}</p>
            </div>

            <div className="journey-horizontal-viewport" data-journey-viewport>
                <div className="journey-list" data-journey-track>
                    {journeyItems.map((item) => (
                        <article
                            key={item.number}
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
                    <div className="journey-track-tail" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
