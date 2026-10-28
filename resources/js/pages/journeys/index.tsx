import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem, Journey } from '@/types';
import * as journeyRoutes from '@/routes/journeys';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Journey', href: journeyRoutes.index() }];

export default function JourneysIndex({ journeys }: { journeys: Journey[] }) {
    const removeJourney = (journey: Journey) => {
        if (window.confirm(`Hapus perjalanan “${journey.title}” di ${journey.organization}?`)) {
            router.delete(journeyRoutes.destroy(journey.id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journey" /><Head><meta name="robots" content="noindex, nofollow" /></Head>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div><h1 className="text-2xl font-semibold">Journey</h1><p className="text-sm text-muted-foreground">Kelola pendidikan dan pengalaman profesional yang tampil di halaman utama.</p></div>
                    <Button asChild><Link href={journeyRoutes.create()}><Plus /> Tambah perjalanan</Link></Button>
                </div>
                {journeys.length ? (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[800px] text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Dokumentasi</th><th className="px-4 py-3 font-medium">Kategori</th><th className="px-4 py-3 font-medium">Institusi / perusahaan</th><th className="px-4 py-3 font-medium">Program / posisi</th><th className="px-4 py-3 font-medium">Periode</th><th className="px-4 py-3 text-right font-medium">Aksi</th></tr></thead>
                            <tbody className="divide-y">{journeys.map((journey) => <tr key={journey.id} className="bg-card">
                                <td className="px-4 py-3">{journey.documentationUrl ? <img src={journey.documentationUrl} alt={journey.title} className="h-14 w-20 rounded border bg-muted object-contain" /> : <span className="text-muted-foreground">—</span>}</td>
                                <td className="px-4 py-3">{{ education: 'Pendidikan', internship: 'Magang', workExperience: 'Pengalaman kerja' }[journey.category]}</td>
                                <td className="max-w-48 truncate px-4 py-3">{journey.organization}</td><td className="max-w-48 truncate px-4 py-3 font-medium">{journey.title}</td>
                                <td className="px-4 py-3">{journey.startYear} – {journey.endYear ?? 'Sekarang'}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link href={journeyRoutes.edit(journey.id)}><Pencil /> Edit</Link></Button><Button type="button" variant="destructive" size="sm" onClick={() => removeJourney(journey)}><Trash2 /> Hapus</Button></div></td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                ) : <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Belum ada perjalanan. Tambahkan pendidikan atau pengalaman pertama.</div>}
            </div>
        </AppLayout>
    );
}

JourneysIndex.layout = { breadcrumbs };
