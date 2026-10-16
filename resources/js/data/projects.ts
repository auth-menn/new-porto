export type Project = {
    id: string;
    titleId: string;
    titleEn: string;
};

export const projects: readonly Project[] = [
    {
        id: 'academic-information-system',
        titleId: 'Sistem Informasi Akademik',
        titleEn: 'Academic Information System',
    },
    {
        id: 'digital-cashier',
        titleId: 'Aplikasi Kasir Digital',
        titleEn: 'Digital Point of Sale',
    },
    {
        id: 'news-portal',
        titleId: 'Portal Berita',
        titleEn: 'News Portal',
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
