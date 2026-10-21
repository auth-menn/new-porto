import { useSyncExternalStore } from 'react';

export type ActiveSection =
    | 'home'
    | 'tentang'
    | 'proyek'
    | 'perjalanan'
    | 'kontak';

let scrollSection: ActiveSection = 'home';
let optimisticSection: ActiveSection | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): ActiveSection {
    return optimisticSection ?? scrollSection;
}

function notify(): void {
    listeners.forEach((listener) => listener());
}

export function setScrollActiveSection(section: ActiveSection): void {
    if (scrollSection === section) return;
    scrollSection = section;
    notify();
}

export function setOptimisticActiveSection(
    section: ActiveSection | null,
): void {
    if (optimisticSection === section) return;
    optimisticSection = section;
    notify();
}

export function useActiveSection(): ActiveSection {
    return useSyncExternalStore(subscribe, getSnapshot, () => 'home');
}
