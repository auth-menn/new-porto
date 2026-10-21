import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type PhotoOwner = 'about' | 'fly' | 'gone';

let flightStart = 0;
let exitEnd = Number.POSITIVE_INFINITY;
let initialRefresh: Promise<void> | null = null;
let widthRefreshTimer = 0;

export function setPhotoScrollRange(start: number, end: number): void {
    flightStart = start;
    exitEnd = end;
}

export function ownerFor(scrollY: number): PhotoOwner {
    if (scrollY <= flightStart) return 'about';
    if (scrollY >= exitEnd) return 'gone';

    return 'fly';
}

export function syncPhotoOwner(scrollY: number): PhotoOwner {
    const owner = ownerFor(scrollY);
    const root = document.documentElement;

    if (root.dataset.photoOwner !== owner) {
        root.dataset.photoOwner = owner;
    }

    return owner;
}

function waitForImage(image: HTMLImageElement): Promise<void> {
    const decode = () => image.decode().catch(() => undefined);

    if (image.complete) return decode();

    return new Promise<void>((resolve) => {
        image.addEventListener('load', () => void decode().then(resolve), {
            once: true,
        });
        image.addEventListener('error', () => resolve(), { once: true });
    });
}

export function scheduleInitialScrollRefresh(): Promise<void> {
    if (initialRefresh) return initialRefresh;

    const ready = Promise.all([
        document.fonts.ready.then(() => undefined),
        Promise.all(Array.from(document.images, waitForImage)).then(
            () => undefined,
        ),
    ]);
    const timeout = new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1500);
    });

    initialRefresh = Promise.race([ready, timeout]).then(() => {
        ScrollTrigger.refresh();
    });

    return initialRefresh;
}

export function installScrollRefreshLifecycle(): () => void {
    ScrollTrigger.config({ ignoreMobileResize: true });

    let previousWidth = window.innerWidth;

    const onResize = () => {
        const nextWidth = window.innerWidth;
        if (nextWidth === previousWidth) return;

        previousWidth = nextWidth;
        window.clearTimeout(widthRefreshTimer);
        widthRefreshTimer = window.setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    };

    window.addEventListener('resize', onResize, { passive: true });

    return () => {
        window.removeEventListener('resize', onResize);
        window.clearTimeout(widthRefreshTimer);
    };
}
