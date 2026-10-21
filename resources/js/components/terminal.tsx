import '@fontsource/jetbrains-mono/latin-400.css';
import {
    Fragment,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { ArchLogo } from '@/components/arch-logo';
import { projects } from '@/data/projects';
import {
    ABOUT_CONTENT,
    tokenizeTerminalLine,
    type SyntaxColor,
    type TerminalOutputKind,
} from '@/data/about';
import { useAppearance } from '@/hooks/use-appearance';
import { useLang } from '@/lib/i18n';

type OutputKey =
    | keyof typeof ABOUT_CONTENT
    | 'help'
    | 'clear'
    | 'unknown'
    | 'fastfetch'
    | 'ls'
    | 'whoami'
    | 'pwd'
    | 'uname'
    | 'date'
    | 'echo'
    | 'sudo';

type TerminalEntry = { command: string; outputKey: OutputKey };
type TerminalProps = {
    active: boolean;
    themeTransitionsReady: boolean;
    onReady: () => void;
    onExit: () => void;
};

const commandLabels = [
    'fastfetch',
    'about',
    'skills',
    'experience',
    'education',
    'projects',
    'contact',
    'help',
    'clear',
] as const;

const paletteColors: SyntaxColor[] = [
    'string',
    'user',
    'path',
    'command',
    'arg',
    'keyword',
    'label',
    'error',
];

function renderTerminalText(text: string, kind: TerminalOutputKind) {
    return text.split('\n').map((line, lineIndex, lines) => (
        <Fragment key={lineIndex}>
            {tokenizeTerminalLine(line, kind).map((segment, segmentIndex) => (
                <span
                    className={
                        segment.c ? `terminal-token-${segment.c}` : undefined
                    }
                    key={segmentIndex}
                >
                    {segment.t}
                </span>
            ))}
            {lineIndex < lines.length - 1 && '\n'}
        </Fragment>
    ));
}

function renderPrompt(command?: string) {
    const [commandName = '', ...argumentsParts] = command
        ? command.split(/(\s+)/)
        : [];

    return (
        <>
            <span className="terminal-token-fg">[</span>
            <span className="terminal-token-user">visitor</span>
            <span className="terminal-token-fg">@</span>
            <span className="terminal-token-user">archlinux</span>
            <span className="terminal-token-fg"> </span>
            <span className="terminal-token-path">~</span>
            <span className="terminal-token-fg">]$ </span>
            {command && (
                <>
                    <span className="terminal-token-command">
                        {commandName}
                    </span>
                    {argumentsParts.map((part, index) => (
                        <span
                            className={
                                /\s/.test(part)
                                    ? undefined
                                    : 'terminal-token-arg'
                            }
                            key={index}
                        >
                            {part}
                        </span>
                    ))}
                </>
            )}
        </>
    );
}

const commandAliases: Record<string, string> = {
    neofetch: 'fastfetch',
    'cat about.md': 'about',
    'pacman -q': 'skills',
    'cat skills.txt': 'skills',
    'cat experience.log': 'experience',
    'cat education.log': 'education',
    'ls projects': 'projects',
    'cat contact.txt': 'contact',
};

function resolveCommand(rawCommand: string): {
    key: OutputKey;
    argument: string;
} {
    const normalized = rawCommand.trim().toLowerCase();
    const canonical = commandAliases[normalized] ?? normalized;
    if (
        canonical === 'fastfetch' ||
        canonical === 'about' ||
        canonical === 'skills' ||
        canonical === 'experience' ||
        canonical === 'education' ||
        canonical === 'projects' ||
        canonical === 'contact' ||
        canonical === 'help' ||
        canonical === 'clear'
    ) {
        return { key: canonical, argument: '' };
    }
    if (
        canonical === 'whoami' ||
        canonical === 'pwd' ||
        canonical === 'ls' ||
        canonical === 'date'
    )
        return { key: canonical, argument: '' };
    if (canonical === 'uname -a') return { key: 'uname', argument: '' };
    if (canonical.startsWith('echo '))
        return { key: 'echo', argument: rawCommand.trim().slice(5) };
    if (canonical === 'echo') return { key: 'echo', argument: '' };
    if (canonical === 'exit' || canonical === 'logout')
        return { key: 'clear', argument: 'exit' };
    if (canonical === 'sudo' || canonical.startsWith('sudo '))
        return { key: 'sudo', argument: '' };
    return { key: 'unknown', argument: rawCommand.trim() };
}

function getOutput(entry: TerminalEntry, language: 'id' | 'en'): string {
    const { outputKey, command } = entry;
    if (outputKey === 'unknown') return `bash: ${command}: command not found`;
    if (outputKey === 'fastfetch') {
        return 'visitor@archlinux\n----------------\nName:     Firman Maulana Syabani\nRole:     IT Developer\nStack:    Laravel, React, TypeScript, Inertia, Tailwind CSS, MySQL\nLocation: [Kota], Indonesia\nContact:  hello@example.com';
    }
    if (outputKey === 'ls')
        return 'about.md  skills.txt  experience.log  education.log  contact.txt  projects/';
    if (outputKey === 'projects')
        return projects
            .map(
                (project) =>
                    `${(language === 'id' ? project.titleId : project.titleEn).replace(/\s+/g, '-')}/`,
            )
            .join('\n');
    if (outputKey === 'whoami') return 'visitor';
    if (outputKey === 'pwd') return '/home/visitor';
    if (outputKey === 'uname')
        return 'Linux archlinux 6.12.1-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
    if (outputKey === 'date')
        return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
            dateStyle: 'full',
        }).format(new Date());
    if (outputKey === 'echo') return command.slice(5);
    if (outputKey === 'sudo')
        return 'visitor is not in the sudoers file. This incident will be reported.';
    if (outputKey === 'help') {
        return language === 'id'
            ? 'fastfetch  about  skills  experience  education  projects  contact  help  clear\nls  whoami  pwd  uname -a  date  echo <teks>  sudo <perintah>  exit'
            : 'fastfetch  about  skills  experience  education  projects  contact  help  clear\nls  whoami  pwd  uname -a  date  echo <text>  sudo <command>  exit';
    }
    if (outputKey === 'clear') return '';
    return ABOUT_CONTENT[outputKey][language].join('\n');
}

function isStructured(key: OutputKey): boolean {
    return [
        'fastfetch',
        'ls',
        'skills',
        'projects',
        'experience',
        'education',
        'contact',
        'help',
    ].includes(key);
}

export default function Terminal({
    active,
    themeTransitionsReady,
    onReady,
    onExit,
}: TerminalProps) {
    const { language, t } = useLang();
    const { resolvedAppearance } = useAppearance();
    const terminalTone = resolvedAppearance === 'dark' ? 'light' : 'dark';
    const [entries, setEntries] = useState<TerminalEntry[]>([]);
    const [typing, setTyping] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [command, setCommand] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [announced, setAnnounced] = useState('');
    const [showIdleCaret, setShowIdleCaret] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const typeState = useRef<{
        text: string;
        start: number;
        shown: number;
        structured: boolean;
    } | null>(null);
    const rafRef = useRef(0);
    const firstInteractionRef = useRef(false);
    const historyRef = useRef<string[]>([]);

    useLayoutEffect(() => {
        onReady();
    }, [onReady]);

    const outputFor = useCallback(
        (entry: TerminalEntry) => getOutput(entry, language),
        [language],
    );

    const skipTyping = useCallback(() => {
        if (!typeState.current) return;
        cancelAnimationFrame(rafRef.current);
        setTyping(typeState.current.text);
        setAnnounced(typeState.current.text);
        typeState.current = null;
        setIsTyping(false);
    }, []);

    const typeText = useCallback(
        (text: string, structured = false, interval = 12) => {
            if (
                window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                !text
            ) {
                setTyping(text);
                setAnnounced(text);
                setIsTyping(false);
                return;
            }
            typeState.current = { text, start: 0, shown: 0, structured };
            setTyping('');
            setAnnounced('');
            setIsTyping(true);
            const frame = (time: number) => {
                const state = typeState.current;
                if (!state) return;
                if (!state.start) state.start = time;
                let visibleText = '';
                if (state.structured) {
                    const lines = state.text.split('\n');
                    const visibleCount = Math.min(
                        lines.length,
                        Math.floor((time - state.start) / interval),
                    );
                    if (visibleCount !== state.shown) {
                        state.shown = visibleCount;
                        visibleText = lines.slice(0, visibleCount).join('\n');
                        setTyping(visibleText);
                        outputRef.current?.scrollTo({
                            top: outputRef.current.scrollHeight,
                        });
                    }
                    if (state.shown >= lines.length) {
                        setAnnounced(state.text);
                        typeState.current = null;
                        setIsTyping(false);
                        return;
                    }
                } else {
                    const shown = Math.min(
                        state.text.length,
                        Math.floor((time - state.start) / interval),
                    );
                    if (shown !== state.shown) {
                        state.shown = shown;
                        visibleText = state.text.slice(0, shown);
                        setTyping(visibleText);
                    }
                    if (shown >= state.text.length) {
                        setAnnounced(state.text);
                        typeState.current = null;
                        setIsTyping(false);
                        return;
                    }
                }
                rafRef.current = requestAnimationFrame(frame);
            };
            rafRef.current = requestAnimationFrame(frame);
        },
        [],
    );

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    useEffect(() => {
        if (active) return;
        inputRef.current?.blur();
        skipTyping();
    }, [active, skipTyping]);

    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }, [entries, isTyping]);

    const runCommand = (rawCommand: string) => {
        const raw = rawCommand.trim();
        if (!raw) return;
        skipTyping();
        const resolved = resolveCommand(raw);
        if (resolved.key === 'clear') {
            if (resolved.argument === 'exit') {
                onExit();
                return;
            }
            setEntries([]);
            setTyping('');
            setAnnounced('');
            return;
        }
        const canonical =
            resolved.key === 'unknown'
                ? raw
                : resolved.key === 'uname'
                  ? 'uname -a'
                  : resolved.key === 'echo' || resolved.key === 'sudo'
                    ? raw
                    : resolved.key;
        historyRef.current = [...historyRef.current, raw];
        setHistoryIndex(-1);
        const entry: TerminalEntry = {
            command: canonical,
            outputKey: resolved.key,
        };
        setEntries((current) => [...current, entry]);
        const text = outputFor(entry);
        typeText(
            text,
            isStructured(resolved.key),
            resolved.key === 'fastfetch' ? 35 : 35,
        );
    };

    const firstClick = () => {
        if (!firstInteractionRef.current) {
            firstInteractionRef.current = true;
            const entry: TerminalEntry = {
                command: 'about',
                outputKey: 'about',
            };
            setEntries([entry]);
            typeText(outputFor(entry));
        }
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.ctrlKey && event.key.toLowerCase() === 'l') {
            event.preventDefault();
            setEntries([]);
            setTyping('');
            setAnnounced('');
            return;
        }
        if (isTyping) {
            skipTyping();
            if (event.key !== 'Enter') return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            runCommand(command);
            setCommand('');
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            const next = Math.max(
                0,
                (historyIndex < 0 ? historyRef.current.length : historyIndex) -
                    1,
            );
            setHistoryIndex(next);
            setCommand(historyRef.current[next] ?? '');
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            const next = Math.min(historyRef.current.length, historyIndex + 1);
            setHistoryIndex(next);
            setCommand(historyRef.current[next] ?? '');
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const match = commandLabels.find((item) =>
                item.startsWith(command.toLowerCase()),
            );
            if (match) setCommand(match);
        }
    };

    const visibleEntries = entries.map((entry) => ({
        entry,
        output: outputFor(entry),
    }));

    return (
        <section
            aria-label={t('terminalLabel')}
            aria-hidden={!active}
            inert={!active}
            role="region"
            className="about-terminal"
            onClick={(event) => {
                if (isTyping) skipTyping();
                if (!(event.target instanceof HTMLButtonElement)) firstClick();
            }}
            onKeyDown={() => {
                if (isTyping) skipTyping();
            }}
            data-lenis-prevent
        >
            <div
                className={
                    themeTransitionsReady
                        ? 'terminal-window terminal-theme-transition'
                        : 'terminal-window'
                }
                data-term-tone={terminalTone}
            >
                <div
                    aria-hidden="true"
                    className="terminal-arch-background"
                    data-terminal-arch-background
                    data-fit="height"
                >
                    <ArchLogo className="terminal-arch-mark" />
                </div>
                <div className="terminal-titlebar" aria-hidden="true">
                    <span className="terminal-token-comment">
                        visitor@archlinux:~
                    </span>
                </div>
                <div className="terminal-content" data-terminal-content>
                    <div
                        ref={outputRef}
                        className="terminal-output"
                        role="log"
                        aria-live="off"
                    >
                        {visibleEntries.map(({ entry, output }, index) => (
                            <div
                                className="terminal-entry"
                                key={`${index}-${entry.command}`}
                            >
                                {entry.command && (
                                    <div className="terminal-command">
                                        {renderPrompt(entry.command)}
                                    </div>
                                )}
                                {entry.outputKey === 'fastfetch' ? (
                                    <div className="terminal-fastfetch">
                                        <ArchLogo className="terminal-ascii" />
                                        <pre>
                                            {renderTerminalText(
                                                index === entries.length - 1 &&
                                                    isTyping
                                                    ? typing
                                                    : output,
                                                entry.outputKey,
                                            )}
                                        </pre>
                                    </div>
                                ) : (
                                    <pre>
                                        {renderTerminalText(
                                            index === entries.length - 1 &&
                                                isTyping
                                                ? typing
                                                : output,
                                            entry.outputKey,
                                        )}
                                    </pre>
                                )}
                                {entry.outputKey === 'fastfetch' &&
                                    !isTyping && (
                                        <div
                                            className="terminal-palette"
                                            aria-hidden="true"
                                        >
                                            {paletteColors.map((color) => (
                                                <i
                                                    key={color}
                                                    className={`terminal-palette-${color}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                        <div className="terminal-prompt">
                            <label htmlFor="terminal-command-input">
                                {renderPrompt()}
                            </label>
                            <span className="terminal-input-wrap">
                                <input
                                    ref={inputRef}
                                    id="terminal-command-input"
                                    aria-label={t('terminalInput')}
                                    value={command}
                                    onChange={(event) =>
                                        setCommand(event.target.value)
                                    }
                                    data-term-tone={terminalTone}
                                    onKeyDown={handleKeyDown}
                                    onFocus={(event) => {
                                        setShowIdleCaret(false);
                                        event.currentTarget.scrollIntoView({
                                            block: 'nearest',
                                        });
                                    }}
                                    onBlur={() => setShowIdleCaret(true)}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                {!command && showIdleCaret && (
                                    <span
                                        aria-hidden="true"
                                        className="terminal-caret"
                                    />
                                )}
                            </span>
                        </div>
                        <div
                            className="terminal-chips"
                            aria-label={t('terminalCommands')}
                        >
                            {commandLabels.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        runCommand(item);
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="terminal-statusbar" aria-hidden="true">
                    <span>
                        <span className="terminal-token-user">[portfolio]</span>{' '}
                        <span className="terminal-token-path">0:bash*</span>
                    </span>
                    <span className="terminal-token-comment">
                        Firman Maulana Syabani
                    </span>
                </div>
            </div>
            <span className="sr-only" aria-live="polite">
                {announced}
            </span>
        </section>
    );
}
