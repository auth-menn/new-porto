import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ProjectForm } from '@/components/projects/project-form';
import type { BreadcrumbItem } from '@/types';
import * as projectRoutes from '@/routes/projects';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: projectRoutes.index() },
    { title: 'Tambah proyek', href: projectRoutes.create() },
];

export default function ProjectCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah proyek" />
            <Head><meta name="robots" content="noindex, nofollow" /></Head>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div><h1 className="text-2xl font-semibold">Tambah proyek</h1><p className="text-sm text-muted-foreground">Gambar wajib diunggah. Link domain boleh dikosongkan.</p></div>
                <ProjectForm />
            </div>
        </AppLayout>
    );
}

ProjectCreate.layout = { breadcrumbs };
