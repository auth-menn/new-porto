import { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { MouseEvent, RefObject } from 'react';
import {
    useActiveSection,
    setOptimisticActiveSection,
} from '@/hooks/use-active-section';
import { useLang } from '@/lib/i18n';
import { goToSection } from '@/lib/scroll-nav';
import type { MenuImages } from '@/types';

type FullscreenMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
    headerRef: RefObject<HTMLElement | null>;
    themeTransitionsReady: boolean;
    menuImages: MenuImages;
};

const pageLinks = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/#tentang' },
    { key: 'projects', href: '/#proyek' },
    { key: 'journey', href: '/#perjalanan' },
    { key: 'contact', href: '/#kontak' },
] as const;

const socialLinks = [
    { key: 'github', href: 'https://github.com/auth-menn' },
    {
        key: 'linkedin',
        href: 'https://www.linkedin.com/in/firman-maulana-syabani/',
    },
    {
        key: 'instagram',
        href: 'https://www.instagram.com/yourmenm?mdxt=MXg1Y2F5Zzlicnc5cQ%3D%3D&utm_source=qr',
    },
] as const;

function MenuPhoto({ src }: { src: string }) {
    const [available, setAvailable] = useState(true);

    return (
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden border border-[var(--menu-fg)]/60">
            {available && (
                <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => setAvailable(false)}
                    className="absolute inset-0 size-full object-cover"
                />
            )}
        </div>
    );
}

function PhotoColumn({ images, reverse = false }: { images: MenuImages['left']; reverse?: boolean }) {
    if (images.length === 0) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            className={`menu-photo-column absolute w-[19.5vw] max-w-[380px] min-w-[120px] ${reverse ? 'left-[29%]' : 'left-[6%]'}`}
        >
            <div
                className={`menu-photo-track flex flex-col ${reverse ? 'menu-photo-track-reverse' : ''}`}
            >
                {[0, 1, 2, 3].map((set) => (
                    <div
                        key={set}
                        className="menu-photo-set flex flex-col gap-[4vh] pb-[4vh]"
                    >
                        {images.map((photo, index) => (
                            <MenuPhoto key={`${photo.id}-${index}`} src={photo.imageUrl} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FullscreenMenu({
    isOpen,
    onClose,
    triggerRef,
    headerRef,
    themeTransitionsReady,
    menuImages,
}: FullscreenMenuProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const { t } = useLang();
    const [activeLink, setActiveLink] = useState<string | null>(null);
    const [menuLogoAvailable, setMenuLogoAvailable] = useState(true);
    const activeSection = useActiveSection();
    const currentUrl = usePage().url;
    const previousUrl = useRef(currentUrl);
    const transitionReady = themeTransitionsReady ? '' : 'transition-none';

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const dialog = dialogRef.current;
        const firstLink = dialog?.querySelector<HTMLElement>('a[href]');
        firstLink?.focus();

        const pageRoot = headerRef.current?.parentElement;
        const pageContent = Array.from(pageRoot?.children ?? []).filter(
            (element) => element !== headerRef.current,
        ) as HTMLElement[];
        const previousPageState = pageContent.map((element) => ({
            element,
            inert: element.inert,
            ariaHidden: element.getAttribute('aria-hidden'),
        }));

        pageContent.forEach((element) => {
            element.inert = true;
            element.setAttribute('aria-hidden', 'true');
        });

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = Array.from(
                dialog?.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            ).filter((element) => element.getClientRects().length > 0);
            const trigger = triggerRef.current;

            if (focusableElements.length === 0) {
                event.preventDefault();
                trigger?.focus();
                return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                (trigger ?? last).focus();
            } else if (event.shiftKey && document.activeElement === trigger) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                (trigger ?? first).focus();
            } else if (!event.shiftKey && document.activeElement === trigger) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            previousPageState.forEach(({ element, inert, ariaHidden }) => {
                element.inert = inert;

                if (ariaHidden === null) {
                    element.removeAttribute('aria-hidden');
                } else {
                    element.setAttribute('aria-hidden', ariaHidden);
                }
            });

            if (triggerRef.current?.isConnected) {
                triggerRef.current.focus();
            }
        };
    }, [headerRef, isOpen, onClose, triggerRef]);

    useEffect(() => {
        if (currentUrl !== previousUrl.current) {
            previousUrl.current = currentUrl;
            onClose();
        }
    }, [currentUrl, onClose]);

    const closeOnClick = () => onClose();

    return (
        <div
            ref={dialogRef}
            id="fullscreen-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
            aria-hidden={!isOpen}
            className={`pointer-events-auto fixed inset-0 z-40 h-dvh overflow-y-auto bg-[var(--menu-bg)] text-[var(--menu-fg)] motion-reduce:transition-none ${isOpen ? 'visible' : 'invisible'} ${transitionReady}`}
            style={{
                clipPath: isOpen ? 'inset(0)' : 'inset(0 0 100% 0)',
                transitionProperty: themeTransitionsReady
                    ? 'clip-path, visibility, background-color, color'
                    : 'none',
                transitionDuration: isOpen
                    ? '700ms, 0ms, 500ms, 500ms'
                    : '450ms, 0ms, 500ms, 500ms',
                transitionTimingFunction:
                    'cubic-bezier(0.76, 0, 0.24, 1), ease, ease, ease',
                transitionDelay: isOpen
                    ? '0ms, 0ms, 0ms, 0ms'
                    : '0ms, 450ms, 0ms, 0ms',
            }}
        >
            <div className="fullscreen-menu-content relative min-h-dvh overflow-hidden px-6 pt-24 pb-10 sm:px-10 md:px-0 md:pt-0 md:pb-0">
                <div
                    className={`fullscreen-menu-gallery pointer-events-none absolute inset-0 overflow-hidden ${isOpen ? '' : '[&_*]:[animation-play-state:paused]'}`}
                >
                    <PhotoColumn images={menuImages.left} />
                    <PhotoColumn images={menuImages.right} reverse />
                </div>

                <nav
                    aria-label={t('pages')}
                    className="fullscreen-menu-nav relative z-10 mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center md:absolute md:top-1/2 md:left-[77%] md:min-h-0 md:w-[42%] md:-translate-x-1/2 md:-translate-y-1/2"
                >
                    <ul className="space-y-0 font-michroma text-[clamp(26px,3.6vw,72px)] leading-[1.15] uppercase">
                        {pageLinks.map((item, index) => {
                            const isActive =
                                activeSection ===
                                (item.href === '/'
                                    ? 'home'
                                    : item.href.split('#')[1]);

                            return (
                            <li
                                key={item.key}
                                className={`transform transition-[transform,opacity] duration-500 motion-reduce:transition-none ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                                style={{
                                    transitionDelay: isOpen
                                        ? `${index * 70}ms`
                                        : '0ms',
                                }}
                            >
                                <Link
                                    href={item.href}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        const section =
                                            item.href === '/'
                                                ? 'home'
                                                : item.href.split('#')[1];
                                        if (
                                            section === 'home' ||
                                            (section &&
                                                document.getElementById(
                                                    section,
                                                ))
                                        ) {
                                            setOptimisticActiveSection(
                                                section as
                                                    | 'home'
                                                    | 'tentang'
                                                    | 'proyek'
                                                    | 'perjalanan'
                                                    | 'kontak',
                                            );
                                        }
                                        onClose();
                                        const delay = window.matchMedia(
                                            '(prefers-reduced-motion: reduce)',
                                        ).matches
                                            ? 0
                                            : 450;
                                        window.setTimeout(() => {
                                            if (
                                                section === 'home' ||
                                                section === 'tentang' ||
                                                section === 'proyek' ||
                                                section === 'perjalanan' ||
                                                section === 'kontak'
                                            ) {
                                                goToSection(section);
                                            }
                                        }, delay);
                                    }}
                                    aria-current={
                                        isActive
                                            ? item.href === '/'
                                                ? 'page'
                                                : 'location'
                                            : undefined
                                    }
                                    onMouseEnter={() => setActiveLink(item.key)}
                                    onFocus={() => setActiveLink(item.key)}
                                    onBlur={() => setActiveLink(null)}
                                    onMouseLeave={() => setActiveLink(null)}
                                    className={`relative inline-block whitespace-nowrap transition-[opacity,color,filter] duration-300 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--menu-fg)] after:transition-[transform,filter] after:duration-300 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--menu-fg)] focus-visible:after:scale-x-100 aria-[current=location]:top-auto aria-[current=location]:bottom-0 aria-[current=location]:h-[2px] aria-[current=location]:scale-100 aria-[current=location]:drop-shadow-[0_0_8px_var(--menu-fg)] aria-[current=location]:text-[var(--menu-fg)] aria-[current=location]:drop-shadow-[0_0_12px_var(--menu-fg)] aria-[current=page]:top-auto aria-[current=page]:bottom-0 aria-[current=page]:h-[2px] aria-[current=page]:scale-100 aria-[current=page]:drop-shadow-[0_0_8px_var(--menu-fg)] aria-[current=page]:text-[var(--menu-fg)] aria-[current=page]:drop-shadow-[0_0_12px_var(--menu-fg)] ${isActive ? 'text-[var(--menu-fg)] drop-shadow-[0_0_12px_var(--menu-fg)]' : 'opacity-55'} ${activeLink && activeLink !== item.key && !isActive ? 'opacity-55' : ''}`}
                                >
                                    {t(item.key)}
                                </Link>
                            </li>
                            );
                        })}
                        {menuLogoAvailable && (
                            <li
                                aria-hidden="true"
                                className={`flex justify-center transition-[transform,opacity] duration-500 motion-reduce:transition-none ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                                style={{
                                    transitionDelay: isOpen
                                        ? `${pageLinks.length * 70}ms`
                                        : '0ms',
                                }}
                            >
                                <img
                                    src="/images/logo.webp"
                                    alt=""
                                    width={1254}
                                    height={1254}
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                    onError={() => setMenuLogoAvailable(false)}
                                    className="mt-7 mb-[18px] h-[clamp(64px,6vw,112px)] w-auto object-contain max-[767px]:h-16"
                                />
                            </li>
                        )}
                    </ul>

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] tracking-[0.22em] uppercase opacity-60">
                            {t('developerRole')}
                        </span>
                    </div>

                    <div className="fullscreen-menu-contact-mobile mt-10 flex flex-col items-center gap-5 md:hidden">
                        <ContactAndSocial closeOnClick={closeOnClick} />
                    </div>
                </nav>

                <div className="fullscreen-menu-contact-desktop relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5 pb-4 md:absolute md:right-[6%] md:bottom-[4%] md:w-[42%] md:max-w-none md:pb-0">
                    <div className="hidden flex-col items-center gap-4 md:flex">
                        <ContactAndSocial closeOnClick={closeOnClick} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactAndSocial({ closeOnClick }: { closeOnClick: () => void }) {
    const { t } = useLang();

    const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setOptimisticActiveSection('kontak');
        closeOnClick();

        const delay = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches
            ? 0
            : 450;

        window.setTimeout(() => goToSection('kontak'), delay);
    };

    return (
        <>
            <a
                href="/#kontak"
                onClick={handleContactClick}
                className="inline-flex min-h-11 items-center gap-2 font-michroma text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
                {t('contactMe')}
                <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
            <div className="flex flex-wrap items-center justify-center gap-x-[2vw] gap-y-3 font-michroma text-[10px] uppercase sm:text-xs">
                {socialLinks.map(({ key, href }) => (
                    <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeOnClick}
                        className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    >
                        {t(key)}
                    </a>
                ))}
                <a
                    href="https://drive.google.com/file/d/1e5EbcFGfLl9KUbw5xdA1i11DC00OShUd/view?usp=drive_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeOnClick}
                    className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                    {t('downloadCv')}
                </a>
            </div>
        </>
    );
}
