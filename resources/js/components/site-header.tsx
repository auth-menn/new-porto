import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Moon, Sun } from 'lucide-react';
import { FullscreenMenu } from '@/components/fullscreen-menu';
import { SiteLogo } from '@/components/site-logo';
import { FlagGB, FlagID } from '@/components/flags';
import { useLang } from '@/lib/i18n';

type SiteHeaderProps = {
    isDark: boolean;
    onAppearanceToggle: () => void;
    themeTransitionsReady: boolean;
};

type LanguageDropdownProps = {
    isMenuOpen: boolean;
    transitionReady: string;
};

function LanguageDropdown({
    isMenuOpen,
    transitionReady,
}: LanguageDropdownProps) {
    const { language, setLanguage, t } = useLang();
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const selectedIndex = language === 'id' ? 0 : 1;
    const panelColors = isMenuOpen
        ? 'border-[var(--menu-fg)] bg-[var(--menu-bg)] text-[var(--menu-fg)]'
        : 'border-[var(--panel-fg)] bg-[var(--panel-bg)] text-[var(--panel-fg)]';
    const triggerHover = isMenuOpen
        ? 'hover:bg-[color-mix(in_srgb,var(--menu-fg)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--menu-fg)_10%,transparent)]'
        : 'hover:bg-[color-mix(in_srgb,var(--panel-fg)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--panel-fg)_10%,transparent)]';
    const optionHover = isMenuOpen
        ? 'hover:bg-[color-mix(in_srgb,var(--menu-fg)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--menu-fg)_10%,transparent)]'
        : 'hover:bg-[color-mix(in_srgb,var(--panel-fg)_10%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--panel-fg)_10%,transparent)]';

    const focusOption = (index: number) => {
        optionRefs.current[index]?.focus();
    };

    const openAndFocus = () => {
        setIsOpen(true);
        requestAnimationFrame(() => focusOption(selectedIndex));
    };

    const closeAndFocusTrigger = () => {
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const selectLanguage = (nextLanguage: 'id' | 'en') => {
        setLanguage(nextLanguage);
        closeAndFocusTrigger();
    };

    useEffect(() => {
        if (isMenuOpen) {
            setIsOpen(false);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const closeOnOutsidePointer = (event: PointerEvent) => {
            const target = event.target;

            if (
                target instanceof Node &&
                !triggerRef.current?.contains(target) &&
                !panelRef.current?.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', closeOnOutsidePointer);

        return () => {
            document.removeEventListener('pointerdown', closeOnOutsidePointer);
        };
    }, [isOpen]);

    const handleTriggerKeyDown = (
        event: React.KeyboardEvent<HTMLButtonElement>,
    ) => {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();

            if (isOpen && (event.key === 'Enter' || event.key === ' ')) {
                setIsOpen(false);
            } else {
                openAndFocus();
            }
        } else if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            closeAndFocusTrigger();
        } else if (event.key === 'Tab' && isOpen) {
            setIsOpen(false);
        }
    };

    const handleOptionKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
        index: number,
    ) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusOption((index + 1) % 2);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusOption((index + 1) % 2);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusOption(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusOption(1);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectLanguage(index === 0 ? 'id' : 'en');
        } else if (event.key === 'Escape') {
            event.preventDefault();
            closeAndFocusTrigger();
        } else if (event.key === 'Tab') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative flex h-11 shrink-0 items-center">
            <button
                ref={triggerRef}
                id="language-selector-trigger"
                type="button"
                aria-label={t('language')}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="language-selector-listbox"
                onClick={() => (isOpen ? setIsOpen(false) : openAndFocus())}
                onKeyDown={handleTriggerKeyDown}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-[10px] px-1 font-michroma text-[10px] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-[399px]:w-11 max-[399px]:gap-0 min-[400px]:min-w-[72px] ${triggerHover} ${transitionReady}`}
            >
                {language === 'id' ? (
                    <FlagID className="shrink-0 rounded-[2px]" />
                ) : (
                    <FlagGB className="shrink-0 rounded-[2px]" />
                )}
                <span className="max-[399px]:hidden">
                    {language.toUpperCase()}
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className={`size-[14px] shrink-0 transition-transform duration-150 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                ref={panelRef}
                id="language-selector-listbox"
                role="listbox"
                aria-labelledby="language-selector-trigger"
                aria-hidden={!isOpen}
                className={`absolute top-full right-0 z-[60] mt-1 min-w-[160px] rounded-xl border p-1 transition-[opacity,transform] duration-150 motion-reduce:transition-none ${panelColors} ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}
            >
                {(['id', 'en'] as const).map((optionLanguage, index) => {
                    const isSelected = language === optionLanguage;
                    const OptionFlag =
                        optionLanguage === 'id' ? FlagID : FlagGB;

                    return (
                        <div
                            key={optionLanguage}
                            ref={(element) => {
                                optionRefs.current[index] = element;
                            }}
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={
                                isOpen && selectedIndex === index ? 0 : -1
                            }
                            onClick={() => selectLanguage(optionLanguage)}
                            onKeyDown={(event) =>
                                handleOptionKeyDown(event, index)
                            }
                            className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100 focus-visible:opacity-100'} ${optionHover} focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-current`}
                        >
                            <OptionFlag className="shrink-0 rounded-[2px]" />
                            <span className="flex-1 whitespace-nowrap">
                                {t(
                                    optionLanguage === 'id'
                                        ? 'indonesian'
                                        : 'english',
                                )}
                            </span>
                            {isSelected && (
                                <Check
                                    aria-hidden="true"
                                    className="size-4 shrink-0"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function SiteHeader({
    isDark,
    onAppearanceToggle,
    themeTransitionsReady,
}: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const { language, t } = useLang();
    const transitionReady = themeTransitionsReady ? '' : 'transition-none';
    const clusterColor = isMenuOpen
        ? 'text-[var(--menu-fg)]'
        : 'text-[var(--panel-fg)]';
    const frameControlColor = isMenuOpen
        ? 'text-[var(--menu-fg)]'
        : 'text-[var(--frame-fg)]';

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    return (
        <header
            ref={headerRef}
            data-site-header
            data-edge="frame"
            data-menu-open={isMenuOpen}
            className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[max(56px,6.9vh)] items-center justify-between px-[max(12px,1.2vw)] ${transitionReady}`}
        >
            <div
                data-header-edge-color
                className={`pointer-events-auto relative z-50 flex h-full items-center transition-colors duration-500 motion-reduce:transition-none ${frameControlColor}`}
            >
                <SiteLogo language={language} />
            </div>

            <div
                className={`pointer-events-auto absolute top-[calc(max(6px,1vh)+(max(64px,7.5vh)-max(6px,1vh)-44px)/2)] left-1/2 z-50 flex h-11 -translate-x-1/2 items-center gap-4 transition-colors duration-500 motion-reduce:transition-none max-[767px]:top-[calc(max(64px,7.5vh)-52px+4px)] max-[767px]:gap-0 ${clusterColor} ${transitionReady}`}
            >
                <button
                    type="button"
                    aria-label={isDark ? t('themeLight') : t('themeDark')}
                    onClick={onAppearanceToggle}
                    className="inline-flex size-11 shrink-0 items-center justify-center transition-opacity duration-300 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                >
                    {isDark ? (
                        <Sun aria-hidden="true" className="size-5" />
                    ) : (
                        <Moon aria-hidden="true" className="size-5" />
                    )}
                </button>

                <LanguageDropdown
                    isMenuOpen={isMenuOpen}
                    transitionReady={transitionReady}
                />
            </div>

            <div
                data-header-edge-color
                className={`pointer-events-auto relative z-50 flex h-full items-center transition-colors duration-500 motion-reduce:transition-none ${frameControlColor}`}
            >
                <button
                    ref={triggerRef}
                    type="button"
                    aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
                    aria-expanded={isMenuOpen}
                    aria-controls="fullscreen-menu"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="pointer-events-auto flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                    <span
                        aria-hidden="true"
                        className={`h-[2px] w-5 origin-center bg-current transition-transform duration-300 motion-reduce:transition-none ${isMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`}
                    />
                    <span
                        aria-hidden="true"
                        className={`h-[2px] w-5 origin-center bg-current transition-transform duration-300 motion-reduce:transition-none ${isMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`}
                    />
                </button>
            </div>

            <FullscreenMenu
                isOpen={isMenuOpen}
                onClose={closeMenu}
                triggerRef={triggerRef}
                headerRef={headerRef}
                themeTransitionsReady={themeTransitionsReady}
            />
        </header>
    );
}
