import type { Language } from '@/lib/i18n';

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
    if (kind === 'unknown' || kind === 'sudo') {
        return [{ t: text, c: 'error' }];
    }

    if (kind === 'fastfetch') {
        if (text === 'visitor@archlinux' || /^-+$/.test(text)) {
            return [{ t: text, c: 'arch' }];
        }
        const label = text.match(
            /^(Name|Role|Stack|Location|Contact|名前|役割|技術|所在地|連絡先|姓名|角色|技术|位置|联系|Имя|Роль|Стек|Место|Контакт|الاسم|الدور|التقنيات|الموقع|التواصل):(\s*)(.*)$/,
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
    Record<Language, string[]>
> = {
    about: {
        id: [
            'Saya mengembangkan aplikasi web untuk mendukung operasional dan meningkatkan alur kerja.',
            'Ruang lingkup saya mencakup pengembangan full-stack, solusi digital untuk klien, serta riset keamanan secara mandiri.',
            'Dengan Laravel, React, dan teknologi web modern, saya terus mengembangkan praktik rekayasa perangkat lunak dan keamanan siber.',
        ],
        en: [
            'I develop web applications that support business operations and improve workflows.',
            'My interests span full-stack development, practical digital solutions, and independent security research.',
            'I use Laravel, React, and modern web technologies while continuing to grow in software engineering and cybersecurity.',
        ],
        ja: [
            '業務を支援し、作業の流れを改善するWebアプリケーションを開発しています。',
            'フルスタック開発、クライアント向けのデジタルソリューション、独立したセキュリティ調査に取り組んでいます。',
            'Laravel、React、最新のWeb技術を活用し、ソフトウェア開発とサイバーセキュリティの知識を深めています。',
        ],
        zh: [
            '我开发 Web 应用，以支持业务运营并改进工作流程。',
            '我的工作方向包括全栈开发、面向客户的数字化解决方案以及独立安全研究。',
            '我使用 Laravel、React 和现代 Web 技术，并持续提升软件开发与网络安全能力。',
        ],
        ru: [
            'Я разрабатываю веб-приложения для поддержки рабочих процессов и повышения эффективности операций.',
            'Мои направления — full-stack-разработка, цифровые решения для клиентов и независимые исследования в области безопасности.',
            'Я использую Laravel, React и современные веб-технологии, продолжая развиваться в разработке ПО и кибербезопасности.',
        ],
        ar: [
            'أطوّر تطبيقات الويب لدعم العمليات وتحسين سير العمل.',
            'تشمل اهتماماتي تطوير التطبيقات المتكاملة، وتقديم الحلول الرقمية للعملاء، والبحث المستقل في مجال الأمن السيبراني.',
            'أستخدم Laravel وReact وتقنيات الويب الحديثة، وأواصل تطوير خبرتي في هندسة البرمجيات والأمن السيبراني.',
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
        ja: ['Laravel', 'React', 'TypeScript', 'Inertia', 'Tailwind CSS', 'MySQL', 'Git'],
        zh: ['Laravel', 'React', 'TypeScript', 'Inertia', 'Tailwind CSS', 'MySQL', 'Git'],
        ru: ['Laravel', 'React', 'TypeScript', 'Inertia', 'Tailwind CSS', 'MySQL', 'Git'],
        ar: ['Laravel', 'React', 'TypeScript', 'Inertia', 'Tailwind CSS', 'MySQL', 'Git'],
    },
    experience: {
        id: ['[Tahun] - [Tahun]  [Posisi] - [Perusahaan]'],
        en: ['[Year] - [Year]  [Position] - [Company]'],
        ja: ['[開始年] - [終了年]  [職種] - [会社名]'],
        zh: ['[开始年份] - [结束年份]  [职位] - [公司名称]'],
        ru: ['[Год начала] - [Год окончания]  [Должность] - [Компания]'],
        ar: ['[سنة البداية] - [سنة النهاية]  [المسمى الوظيفي] - [الشركة]'],
    },
    education: {
        id: ['[Tahun] - [Tahun]  [Program] - [Institusi]'],
        en: ['[Year] - [Year]  [Program] - [Institution]'],
        ja: ['[開始年] - [終了年]  [専攻] - [教育機関]'],
        zh: ['[开始年份] - [结束年份]  [专业] - [院校]'],
        ru: ['[Год начала] - [Год окончания]  [Программа] - [Учебное заведение]'],
        ar: ['[سنة البداية] - [سنة النهاية]  [البرنامج] - [المؤسسة التعليمية]'],
    },
    projects: {
        id: ['Daftar proyek tersedia pada bagian proyek di halaman ini.'],
        en: [
            'Project details are available in the projects section on this page.',
        ],
        ja: ['プロジェクトの詳細は、このページのプロジェクト欄をご覧ください。'],
        zh: ['项目详情请参阅本页面的项目部分。'],
        ru: ['Описание проектов доступно в разделе проектов на этой странице.'],
        ar: ['تجد تفاصيل المشاريع في قسم المشاريع على هذه الصفحة.'],
    },
    contact: {
        id: [
            'Email: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
        ],
        en: [
            'Email: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
        ],
        ja: [
            'メール: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
        ],
        zh: [
            '邮箱: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
        ],
        ru: [
            'Эл. почта: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
        ],
        ar: [
            'البريد الإلكتروني: auth.menn@gmail.com',
            'GitHub: https://github.com/auth-menn',
            'LinkedIn: https://www.linkedin.com/in/firman-maulana-syabani/',
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
