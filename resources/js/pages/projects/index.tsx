import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem, Project } from '@/types';
import * as projectRoutes from '@/routes/projects';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: projectRoutes.index() },
];

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    const removeProject = (project: Project) => {
        if (window.confirm(`Hapus proyek “${project.title}”?`)) {
            router.delete(projectRoutes.destroy(project.id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <Head><meta name="robots" content="noindex, nofollow" /></Head>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Projects</h1>
                        <p className="text-sm text-muted-foreground">Kelola proyek yang tampil di halaman utama.</p>
                    </div>
                    <Button asChild>
                        <Link href={projectRoutes.create()}><Plus /> Tambah proyek</Link>
                    </Button>
                </div>

                {projects.length ? (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">Gambar</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Nama proyek</th>
                                    <th scope="col" className="px-4 py-3 font-medium">Link domain</th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {projects.map((project) => (
                                    <tr key={project.id} className="bg-card">
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <img src={project.laptopImageUrl} alt={`${project.title} — laptop`} className="h-14 w-24 rounded-md border bg-muted object-contain" />
                                                <img src={project.mobileImageUrl} alt={`${project.title} — mobile`} className="h-14 w-14 rounded-md border bg-muted object-contain" />
                                            </div>
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 font-medium">{project.title}</td>
                                        <td className="max-w-sm px-4 py-3">
                                            {project.link ? (
                                                <a href={project.link} target="_blank" rel="noreferrer" className="block truncate text-primary underline-offset-4 hover:underline">
                                                    {project.link}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={projectRoutes.edit(project.id)}><Pencil /> Edit</Link>
                                                </Button>
                                                <Button type="button" variant="destructive" size="sm" onClick={() => removeProject(project)}>
                                                    <Trash2 /> Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                        Belum ada proyek. Tambahkan proyek pertama untuk ditampilkan di halaman utama.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

ProjectsIndex.layout = { breadcrumbs };
