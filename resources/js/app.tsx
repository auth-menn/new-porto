import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { initializeLanguage } from '@/lib/i18n';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';

const appName = 'Firman Maulana Syabani | IT Developer';

initializeLanguage();

void createInertiaApp({
    title: (title) =>
        title === '404' ? '404 | Firman Maulana Syabani' : appName,
    layout: (name) => {
        if (name.startsWith('auth/')) {
            return AuthLayout;
        }

        if (
            name === 'dashboard' ||
            name === 'cms' ||
            name.startsWith('cms/') ||
            name === 'admin' ||
            name.startsWith('admin/')
        ) {
            return AppLayout;
        }

        return undefined;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#000000',
    },
});

// This will set light / dark mode on load...
initializeTheme();
