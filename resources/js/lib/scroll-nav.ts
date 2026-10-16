import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_CONFIG } from '@/data/about-config';
import {
    setOptimisticActiveSection,
    type ActiveSection,
} from '@/hooks/use-active-section';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

let activeTween: gsap.core.Tween | null = null;
let cleanupInterrupts: (() => void) | null = null;

const navigationKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
]);

function clearNavigation(): void {
    activeTween = null;
    cleanupInterrupts?.();
    cleanupInterrupts = null;
    document.documentElement.removeAttribute('data-navigating');
}

function cancelNavigation(): void {
    if (!activeTween) return;
    activeTween.kill();
    clearNavigation();
    setOptimisticActiveSection(null);
}

function targetForSection(id: ActiveSection): number | null {
    if (id === 'home') return 0;

    if (id === 'tentang') {
        const trigger = ScrollTrigger.getById('about-scene');
        if (trigger) {
            return (
                trigger.start +
                (trigger.end - trigger.start) * ABOUT_CONFIG.restAt
            );
        }

        const scene = document.querySelector<HTMLElement>('[data-about-scene]');
        if (!scene) return null;
        const scrollLength = Math.max(
            0,
            scene.scrollHeight - window.innerHeight,
        );
        return (
            scene.getBoundingClientRect().top +
            window.scrollY +
            scrollLength * ABOUT_CONFIG.restAt
        );
    }

    const target = document.getElementById(id);

    if (!target) return null;

    const headerHeight =
        document
            .querySelector<HTMLElement>('[data-site-header]')
            ?.getBoundingClientRect().height ?? 0;

    return target.getBoundingClientRect().top + window.scrollY - headerHeight;
}

export function goToSection(id: ActiveSection): void {
    const target = targetForSection(id);
    if (target === null) return;

    cancelNavigation();
    setOptimisticActiveSection(id);

    const distance = Math.abs(target - window.scrollY);
    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion || distance < 1) {
        window.scrollTo({ top: target, behavior: 'instant' });
        setOptimisticActiveSection(null);
        return;
    }

    document.documentElement.dataset.navigating = 'true';

    const stopOnInput = () => cancelNavigation();
    const stopOnKey = (event: KeyboardEvent) => {
        if (navigationKeys.has(event.key)) stopOnInput();
    };

    window.addEventListener('wheel', stopOnInput, { passive: true });
    window.addEventListener('touchstart', stopOnInput, { passive: true });
    window.addEventListener('keydown', stopOnKey);
    cleanupInterrupts = () => {
        window.removeEventListener('wheel', stopOnInput);
        window.removeEventListener('touchstart', stopOnInput);
        window.removeEventListener('keydown', stopOnKey);
    };

    activeTween = gsap.to(window, {
        scrollTo: { y: target, autoKill: false },
        duration: Math.min(3.4, Math.max(1.6, distance / 1100)),
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => {
            clearNavigation();
            setOptimisticActiveSection(null);
        },
        onInterrupt: () => {
            clearNavigation();
            setOptimisticActiveSection(null);
        },
    });
}
