import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { JourneyForm } from '@/components/journeys/journey-form';
import type { BreadcrumbItem } from '@/types';
import * as journeyRoutes from '@/routes/journeys';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Journey', href: journeyRoutes.index() }, { title: 'Tambah perjalanan', href: journeyRoutes.create() }];

export default function JourneyCreate() {
    return <AppLayout breadcrumbs={breadcrumbs}><Head title="Tambah perjalanan" /><Head><meta name="robots" content="noindex, nofollow" /></Head><div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><div><h1 className="text-2xl font-semibold">Tambah perjalanan</h1><p className="text-sm text-muted-foreground">Isi detail yang akan muncul pada kartu perjalanan di halaman utama.</p></div><JourneyForm /></div></AppLayout>;
}

JourneyCreate.layout = { breadcrumbs };
