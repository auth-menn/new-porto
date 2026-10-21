export type Project = {
    id: string;
    titleId: string;
    titleEn: string;
    liveDemoUrl?: string;
};

export const projects: readonly Project[] = [
    {
        id: 'academic-information-system',
        titleId: 'Sistem Informasi Akademik',
        titleEn: 'Academic Information System',
        liveDemoUrl: 'https://example.com/academic-information-system',
    },
    {
        id: 'digital-cashier',
        titleId: 'Aplikasi Kasir Digital',
        titleEn: 'Digital Point of Sale',
        liveDemoUrl: 'https://example.com/digital-cashier',
    },
    {
        id: 'news-portal',
        titleId: 'Portal Berita',
        titleEn: 'News Portal',
        liveDemoUrl: 'https://example.com/news-portal',
    },
    {
        id: 'analytics-dashboard',
        titleId: 'Dashboard Analitik',
        titleEn: 'Analytics Dashboard',
    },
    {
        id: 'online-store',
        titleId: 'Toko Online',
        titleEn: 'Online Store',
    },
];
