import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ProjectForm } from '@/components/projects/project-form';
import type { BreadcrumbItem, Project } from '@/types';
import * as projectRoutes from '@/routes/projects';

export default function ProjectEdit({ project }: { project: Project }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: projectRoutes.index() },
        { title: 'Edit proyek', href: projectRoutes.edit(project.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${project.title}`} />
            <Head><meta name="robots" content="noindex, nofollow" /></Head>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div><h1 className="text-2xl font-semibold">Edit proyek</h1><p className="text-sm text-muted-foreground">Perbarui detail proyek atau gambar.</p></div>
                <ProjectForm project={project} />
            </div>
        </AppLayout>
    );
}
