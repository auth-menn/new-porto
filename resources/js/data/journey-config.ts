export const JOURNEY_CONFIG = {
    desktop: {
        peekVisibleWPct: 0.216,
        peekVisibleHPct: 0.179,
        exitUpPct: 0.25,
        stepVh: 110,
    },
    mobile: {
        peekVisibleWPct: 0.26,
        peekVisibleHPct: 0.09,
        exitUpPct: 0.2,
        stepVh: 100,
    },
    timing: {
        transition: 1,
        holdBetween: 0.4,
        holdStart: 0.25,
        holdEnd: 0.5,
        peekStagger: 0.15,
        scrub: 1,
    },
    ease: 'power2.inOut',
} as const;
