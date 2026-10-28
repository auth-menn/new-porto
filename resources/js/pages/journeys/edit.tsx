import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { JourneyForm } from '@/components/journeys/journey-form';
import type { BreadcrumbItem, Journey } from '@/types';
import * as journeyRoutes from '@/routes/journeys';

export default function JourneyEdit({ journey }: { journey: Journey }) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Journey', href: journeyRoutes.index() }, { title: 'Edit perjalanan', href: journeyRoutes.edit(journey.id) }];
    return <AppLayout breadcrumbs={breadcrumbs}><Head title={`Edit ${journey.title}`} /><Head><meta name="robots" content="noindex, nofollow" /></Head><div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><div><h1 className="text-2xl font-semibold">Edit perjalanan</h1><p className="text-sm text-muted-foreground">Perbarui informasi perjalanan.</p></div><JourneyForm journey={journey} /></div></AppLayout>;
}
