import { useSyncExternalStore } from 'react';

export type Language = 'id' | 'en';

const translations = {
    id: {
        menu: 'Menu utama',
        openMenu: 'Buka menu',
        closeMenu: 'Tutup menu',
        language: 'Pilih bahasa',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        pages: 'Halaman',
        home: 'Beranda',
        about: 'Tentang',
        projects: 'Proyek',
        projectSummary: 'Ringkasan proyek',
        projectShowcase: 'Galeri gambar proyek',
        scrollProjects: 'Klik ikon panah untuk melihat proyek lainnya',
        viewLiveDemo: 'Lihat demo langsung',
        previousProject: 'Proyek sebelumnya',
        nextProject: 'Proyek berikutnya',
        laptopView: 'Tampilan laptop',
        mobileView: 'Tampilan mobile',
        journey: 'Perjalanan',
        journeyDescription: 'Pendidikan dan pengalaman profesional',
        journeyDocumentation: 'Dokumentasi',
        journeyCurrent: 'Sekarang',
        journeyOrganizationLogo: 'Logo institusi',
        education: 'Pendidikan',
        internship: 'Magang',
        workExperience: 'Pengalaman kerja',
        journeyPeriodPlaceholder: '[Tahun mulai] — [Tahun selesai]',
        educationTitlePlaceholder: '[Nama institusi]',
        educationDetailPlaceholder: '[Program studi / jenjang pendidikan]',
        internshipTitlePlaceholder: '[Posisi magang]',
        workTitlePlaceholder: '[Posisi pekerjaan]',
        companyPlaceholder: '[Nama perusahaan]',
        journeyActivityOnePlaceholder: '[Kegiatan atau tanggung jawab pertama]',
        journeyActivityTwoPlaceholder: '[Kegiatan atau tanggung jawab kedua]',
        journeyActivityThreePlaceholder:
            '[Kegiatan atau tanggung jawab ketiga]',
        contact: 'Kontak',
        contactLampHint: 'Tekan lampu untuk membuka formulir kontak',
        turnLampOn: 'Nyalakan lampu kontak',
        turnLampOff: 'Matikan lampu kontak',
        contactSendMessage: 'Kirim pesan',
        contactFormClose: 'Tutup formulir',
        contactFormTitle: 'Kirim pesan',
        contactFormNameLabel: 'Nama',
        contactFormEmailLabel: 'Email',
        contactFormSubjectLabel: 'Subjek',
        contactFormMessageLabel: 'Pesan',
        contactFormSubmit: 'Kirim',
        contactFormSubjectPrefix: 'Pesan portfolio',
        downloadCv: 'Unduh CV',
        github: 'GitHub',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        youtube: 'YouTube',
        contactMe: 'Hubungi saya',
        scrollDown: 'Gulir ke bawah',
        terminalLabel: 'Terminal informasi portfolio',
        terminalInput: 'Masukkan perintah terminal',
        terminalCommands: 'Perintah terminal yang tersedia',
        developerRole: 'IT Developer',
        copyright: '© 2026 Firman Maulana Syabani',
        freelanceAvailability: 'Tersedia untuk proyek freelance',
        privacy: 'Kebijakan Privasi',
        terms: 'Syarat',
        themeLight: 'Ganti ke mode terang',
        themeDark: 'Ganti ke mode gelap',
    },
    en: {
        menu: 'Main menu',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        language: 'Select language',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        pages: 'Pages',
        home: 'Home',
        about: 'About',
        projects: 'Projects',
        projectSummary: 'Project summary',
        projectShowcase: 'Project image gallery',
        scrollProjects: 'Click the arrow icons to explore more projects',
        viewLiveDemo: 'View live demo',
        previousProject: 'Previous project',
        nextProject: 'Next project',
        laptopView: 'Laptop view',
        mobileView: 'Mobile view',
        journey: 'Journey',
        journeyDescription: 'Education and professional experience',
        journeyDocumentation: 'Documentation',
        journeyCurrent: 'Present',
        journeyOrganizationLogo: 'Organization logo',
        education: 'Education',
        internship: 'Internship',
        workExperience: 'Work experience',
        journeyPeriodPlaceholder: '[Start year] — [End year]',
        educationTitlePlaceholder: '[Institution name]',
        educationDetailPlaceholder: '[Program / qualification]',
        internshipTitlePlaceholder: '[Internship role]',
        workTitlePlaceholder: '[Job title]',
        companyPlaceholder: '[Company name]',
        journeyActivityOnePlaceholder: '[First activity or responsibility]',
        journeyActivityTwoPlaceholder: '[Second activity or responsibility]',
        journeyActivityThreePlaceholder: '[Third activity or responsibility]',
        contact: 'Contact',
        contactLampHint: 'Press the lamp to open the contact form',
        turnLampOn: 'Turn on the contact light',
        turnLampOff: 'Turn off the contact light',
        contactSendMessage: 'Send a message',
        contactFormClose: 'Close the form',
        contactFormTitle: 'Send a message',
        contactFormNameLabel: 'Name',
        contactFormEmailLabel: 'Email',
        contactFormSubjectLabel: 'Subject',
        contactFormMessageLabel: 'Message',
        contactFormSubmit: 'Submit',
        contactFormSubjectPrefix: 'Portfolio message',
        downloadCv: 'Download CV',
        github: 'GitHub',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        youtube: 'YouTube',
        contactMe: 'Contact me',
        scrollDown: 'Scroll down',
        terminalLabel: 'Portfolio information terminal',
        terminalInput: 'Enter a terminal command',
        terminalCommands: 'Available terminal commands',
        developerRole: 'IT Developer',
        copyright: '© 2026 Firman Maulana Syabani',
        freelanceAvailability: 'Available for freelance projects',
        privacy: 'Privacy Policy',
        terms: 'Terms',
        themeLight: 'Switch to light mode',
        themeDark: 'Switch to dark mode',
    },
} as const;

type TranslationKey = keyof (typeof translations)['id'];

let currentLanguage: Language = 'id';
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
    listeners.add(callback);

    return () => listeners.delete(callback);
}

function notify(): void {
    listeners.forEach((listener) => listener());
}

export function initializeLanguage(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const savedLanguage = localStorage.getItem('language');

        if (savedLanguage === 'id' || savedLanguage === 'en') {
            currentLanguage = savedLanguage;
        }
    } catch {
        currentLanguage = 'id';
    }

    document.documentElement.lang = currentLanguage;
    notify();
}

export function setLanguage(language: Language): void {
    currentLanguage = language;
    document.documentElement.lang = language;

    try {
        localStorage.setItem('language', language);
    } catch {
        // The current session still uses the selected language if storage is unavailable.
    }

    notify();
}

export function useLang(): {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
} {
    const language = useSyncExternalStore<Language>(
        subscribe,
        () => currentLanguage,
        () => 'id',
    );

    return {
        language,
        setLanguage,
        t: (key) => translations[language][key],
    };
}
