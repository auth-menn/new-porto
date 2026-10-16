export type AboutCommand =
    | 'fastfetch'
    | 'help'
    | 'about'
    | 'skills'
    | 'experience'
    | 'education'
    | 'projects'
    | 'contact'
    | 'clear';

export type SyntaxColor =
    | 'user'
    | 'path'
    | 'command'
    | 'arg'
    | 'string'
    | 'keyword'
    | 'number'
    | 'label'
    | 'comment'
    | 'error'
    | 'link'
    | 'arch';

export type TerminalSegment = { t: string; c?: SyntaxColor };
export type TerminalOutputKind =
    | AboutCommand
    | 'welcome'
    | 'unknown'
    | 'ls'
    | 'whoami'
    | 'pwd'
    | 'uname'
    | 'date'
    | 'echo'
    | 'sudo';

const knownCommands =
    /\b(fastfetch|about|skills|experience|education|projects|contact|help|clear|ls|whoami|pwd|uname|date|echo|sudo|exit)\b/g;
const knownCommandNames = new Set([
    'fastfetch',
    'about',
    'skills',
    'experience',
    'education',
    'projects',
    'contact',
    'help',
    'clear',
    'ls',
    'whoami',
    'pwd',
    'uname',
    'date',
    'echo',
    'sudo',
    'exit',
]);

function tokenizeInline(text: string): TerminalSegment[] {
    const segments: TerminalSegment[] = [];
    const pattern =
        /(\[[^\]]+\]|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:https?:\/\/|www\.)\S+|\b\d{4}\b)/g;
    let cursor = 0;

    for (const match of text.matchAll(pattern)) {
        const start = match.index ?? 0;
        if (start > cursor) segments.push({ t: text.slice(cursor, start) });
        const token = match[0];
        const color: SyntaxColor = token.startsWith('[')
            ? 'comment'
            : /^\d/.test(token)
              ? 'number'
              : 'link';
        segments.push({ t: token, c: color });
        cursor = start + token.length;
    }

    if (cursor < text.length) segments.push({ t: text.slice(cursor) });
    return segments.length > 0 ? segments : [{ t: text }];
}

export function tokenizeTerminalLine(
    text: string,
    kind: TerminalOutputKind,
): TerminalSegment[] {
    if (kind === 'welcome') {
        return text
            .split(/(`help`)/g)
            .map((part) =>
                part === '`help`'
                    ? { t: part, c: 'command' }
                    : { t: part, c: 'comment' },
            );
    }

    if (kind === 'unknown' || kind === 'sudo') {
        return [{ t: text, c: 'error' }];
    }

    if (kind === 'fastfetch') {
        if (text === 'visitor@archlinux' || /^-+$/.test(text)) {
            return [{ t: text, c: 'arch' }];
        }
        const label = text.match(
            /^(Name|Role|Stack|Location|Contact):(\s*)(.*)$/,
        );
        if (label) {
            return [
                { t: label[1] + ':', c: 'arch' },
                { t: label[2] },
                ...tokenizeInline(label[3]).map((part) =>
                    part.c === 'comment'
                        ? part
                        : { ...part, c: part.c ?? 'string' },
                ),
            ];
        }
    }

    if (kind === 'skills') return [{ t: text, c: 'string' }];
    if (kind === 'projects' && text.endsWith('/'))
        return [{ t: text, c: 'path' }];
    if (kind === 'contact') {
        const separator = text.indexOf(':');
        if (separator >= 0) {
            return [
                { t: text.slice(0, separator + 1), c: 'label' },
                { t: text.slice(separator + 1, separator + 2) },
                ...tokenizeInline(text.slice(separator + 2)).map((part) => ({
                    ...part,
                    c: part.c === 'comment' ? part.c : ('link' as const),
                })),
            ];
        }
    }

    if (/^visitor@archlinux$/.test(text)) {
        return [{ t: text, c: 'user' }];
    }
    if (/^\s*-+\s*$/.test(text)) return [{ t: text, c: 'comment' }];
    if (/^\s*projects\/$/.test(text)) return [{ t: text, c: 'path' }];

    const parts = tokenizeInline(text);
    if (parts.some((part) => part.c)) return parts;
    if (kind === 'about') return [{ t: text, c: 'string' }];

    return text
        .split(knownCommands)
        .map((part) =>
            knownCommandNames.has(part)
                ? { t: part, c: 'command' }
                : { t: part },
        );
}

export const ABOUT_CONTENT: Record<
    Exclude<AboutCommand, 'fastfetch' | 'help' | 'clear'>,
    { id: string[]; en: string[] }
> = {
    about: {
        id: [
            'Saya adalah IT Developer yang berfokus pada pengembangan aplikasi web.',
            'Ringkasan ini menjadi placeholder untuk latar belakang, minat, dan cara saya bekerja.',
            'Detail pengalaman dan proyek akan diperbarui seiring perkembangan portfolio.',
        ],
        en: [
            'I am an IT Developer focused on building web applications.',
            'This summary is a placeholder for my background, interests, and working style.',
            'Experience and project details can be updated as the portfolio grows.',
        ],
    },
    skills: {
        id: [
            'Laravel',
            'React',
            'TypeScript',
            'Inertia',
            'Tailwind CSS',
            'MySQL',
            'Git',
        ],
        en: [
            'Laravel',
            'React',
            'TypeScript',
            'Inertia',
            'Tailwind CSS',
            'MySQL',
            'Git',
        ],
    },
    experience: {
        id: ['[Tahun] - [Tahun]  [Posisi] - [Perusahaan]'],
        en: ['[Year] - [Year]  [Position] - [Company]'],
    },
    education: {
        id: ['[Tahun] - [Tahun]  [Program] - [Institusi]'],
        en: ['[Year] - [Year]  [Program] - [Institution]'],
    },
    projects: {
        id: ['Daftar proyek tersedia pada bagian proyek di halaman ini.'],
        en: [
            'Project details are available in the projects section on this page.',
        ],
    },
    contact: {
        id: [
            'Email: hello@example.com',
            'GitHub: github.com/username',
            'LinkedIn: linkedin.com/in/username',
        ],
        en: [
            'Email: hello@example.com',
            'GitHub: github.com/username',
            'LinkedIn: linkedin.com/in/username',
        ],
    },
};

export const ABOUT_COMMANDS: AboutCommand[] = [
    'fastfetch',
    'about',
    'skills',
    'experience',
    'education',
    'projects',
    'contact',
    'help',
    'clear',
];
