import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Minus, Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    Journey,
    JourneyCategory,
    JourneyTranslations,
} from '@/types';
import * as journeyRoutes from '@/routes/journeys';

type JourneyFormData = {
    category: JourneyCategory;
    organization: string;
    title: string;
    start_year: string;
    end_year: string;
    activities: string[];
    translations: JourneyTranslations;
    logo_image: File | null;
    documentation_image: File | null;
    _method?: 'put';
};

const categories: { value: JourneyCategory; label: string }[] = [
    { value: 'education', label: 'Pendidikan' },
    { value: 'internship', label: 'Magang' },
    { value: 'workExperience', label: 'Pengalaman kerja' },
];

const translationLanguages = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '简体中文' },
    { value: 'ru', label: 'Русский' },
    { value: 'ar', label: 'العربية' },
] as const;

export function JourneyForm({ journey }: { journey?: Journey }) {
    const primaryActivities = journey?.activities ?? [''];
    const translations = Object.fromEntries(
        translationLanguages.map(({ value }) => [
            value,
            {
                title: journey?.translations[value]?.title ?? '',
                activities: primaryActivities.map(
                    (_, index) =>
                        journey?.translations[value]?.activities[index] ?? '',
                ),
            },
        ]),
    ) as JourneyTranslations;
    const form = useForm<JourneyFormData>({
        category: journey?.category ?? 'education',
        organization: journey?.organization ?? '',
        title: journey?.title ?? '',
        start_year: journey ? String(journey.startYear) : '',
        end_year: journey?.endYear ? String(journey.endYear) : '',
        activities: primaryActivities,
        translations,
        logo_image: null,
        documentation_image: null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.documentation_image) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(form.data.documentation_image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.documentation_image]);

    useEffect(() => {
        if (!form.data.logo_image) {
            setLogoPreview(null);
            return;
        }
        const url = URL.createObjectURL(form.data.logo_image);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.logo_image]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (journey) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(journeyRoutes.update(journey.id).url, { forceFormData: true });
            return;
        }
        form.post(journeyRoutes.store().url, { forceFormData: true });
    };

    const updatePrimaryActivities = (activities: string[]) => {
        form.setData('activities', activities);
        form.setData(
            'translations',
            Object.fromEntries(
                translationLanguages.map(({ value }) => [
                    value,
                    {
                        title: form.data.translations[value]?.title ?? '',
                        activities: activities.map(
                            (_, index) =>
                                form.data.translations[value]?.activities[
                                    index
                                ] ?? '',
                        ),
                    },
                ]),
            ) as JourneyTranslations,
        );
    };

    const updateTranslationTitle = (
        language: (typeof translationLanguages)[number]['value'],
        title: string,
    ) => {
        form.setData('translations', {
            ...form.data.translations,
            [language]: {
                title,
                activities: form.data.translations[language]?.activities ?? [],
            },
        });
    };

    const updateTranslationActivity = (
        language: (typeof translationLanguages)[number]['value'],
        index: number,
        activity: string,
    ) => {
        const activities = [
            ...(form.data.translations[language]?.activities ?? []),
        ];
        activities[index] = activity;
        form.setData('translations', {
            ...form.data.translations,
            [language]: {
                title: form.data.translations[language]?.title ?? '',
                activities,
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid max-w-3xl gap-6">
            <div className="grid gap-2">
                <Label>Kategori perjalanan</Label>
                <Select value={form.data.category} onValueChange={(value) => form.setData('category', value as JourneyCategory)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}</SelectContent>
                </Select>
                <InputError message={form.errors.category} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="organization">Institusi / perusahaan</Label>
                <Input id="organization" value={form.data.organization} onChange={(event) => form.setData('organization', event.target.value)} required maxLength={255} />
                <InputError message={form.errors.organization} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="title">Program / posisi (Bahasa Indonesia)</Label>
                <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required maxLength={255} />
                <InputError message={form.errors.title} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="logo_image">Logo institusi / perusahaan (opsional)</Label>
                <Input id="logo_image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => form.setData('logo_image', event.target.files?.[0] ?? null)} />
                <p className="text-sm text-muted-foreground">Logo ditampilkan pada kotak nomor di kartu. JPG, PNG, atau WebP hingga 5 MB.</p>
                <InputError message={form.errors.logo_image} />
                {(logoPreview || journey?.logoUrl) && <img src={logoPreview ?? journey?.logoUrl ?? ''} alt="Pratinjau logo" className="size-20 rounded-xl border bg-muted object-contain p-2" />}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="start_year">Tahun mulai</Label><Input id="start_year" type="number" min="1900" max="2100" value={form.data.start_year} onChange={(event) => form.setData('start_year', event.target.value)} required /><InputError message={form.errors.start_year} /></div>
                <div className="grid gap-2"><Label htmlFor="end_year">Tahun selesai (kosongkan jika masih berlangsung)</Label><Input id="end_year" type="number" min="1900" max="2100" value={form.data.end_year} onChange={(event) => form.setData('end_year', event.target.value)} /><InputError message={form.errors.end_year} /></div>
            </div>
            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                    <Label>Aktivitas / tanggung jawab (Bahasa Indonesia)</Label>
                    <Button type="button" variant="outline" size="sm" disabled={form.data.activities.length >= 8} onClick={() => updatePrimaryActivities([...form.data.activities, ''])}><Plus /> Tambah field</Button>
                </div>
                <div className="grid gap-3">
                    {form.data.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <Input aria-label={`Aktivitas ${index + 1}`} value={activity} onChange={(event) => form.setData('activities', form.data.activities.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} maxLength={500} required />
                            <Button type="button" variant="outline" size="icon" aria-label={`Hapus aktivitas ${index + 1}`} disabled={form.data.activities.length <= 1} onClick={() => updatePrimaryActivities(form.data.activities.filter((_, itemIndex) => itemIndex !== index))}><Minus /></Button>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">Maksimal 8 aktivitas.</p>
                <InputError message={form.errors.activities} />
            </div>
            <div className="grid gap-3">
                <div>
                    <h2 className="font-medium">Terjemahan</h2>
                    <p className="text-sm text-muted-foreground">
                        Bahasa Indonesia menjadi sumber utama. Kolom yang
                        kosong akan menggunakan teks Bahasa Indonesia.
                    </p>
                </div>
                {translationLanguages.map(({ value, label }) => (
                    <details key={value} className="rounded-lg border p-4">
                        <summary className="cursor-pointer font-medium">
                            {label}
                        </summary>
                        <div className="mt-4 grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor={`translation-${value}-title`}>
                                    Program / posisi ({label})
                                </Label>
                                <Input
                                    id={`translation-${value}-title`}
                                    value={
                                        form.data.translations[value]?.title ?? ''
                                    }
                                    onChange={(event) =>
                                        updateTranslationTitle(
                                            value,
                                            event.target.value,
                                        )
                                    }
                                    maxLength={255}
                                />
                                <InputError
                                    message={
                                        form.errors[
                                            `translations.${value}.title`
                                        ]
                                    }
                                />
                            </div>
                            {form.data.activities.map((_, index) => (
                                <div
                                    key={`${value}-activity-${index}`}
                                    className="grid gap-2"
                                >
                                    <Label
                                        htmlFor={`translation-${value}-activity-${index}`}
                                    >
                                        Aktivitas {index + 1} ({label})
                                    </Label>
                                    <Input
                                        id={`translation-${value}-activity-${index}`}
                                        value={
                                            form.data.translations[value]
                                                ?.activities[index] ?? ''
                                        }
                                        onChange={(event) =>
                                            updateTranslationActivity(
                                                value,
                                                index,
                                                event.target.value,
                                            )
                                        }
                                        maxLength={500}
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `translations.${value}.activities.${index}`
                                            ]
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </details>
                ))}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="documentation_image">Gambar dokumentasi (opsional)</Label>
                <Input id="documentation_image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => form.setData('documentation_image', event.target.files?.[0] ?? null)} />
                <p className="text-sm text-muted-foreground">JPG, PNG, atau WebP. Maksimal 5 MB.</p>
                <InputError message={form.errors.documentation_image} />
                {(preview || journey?.documentationUrl) && <img src={preview ?? journey?.documentationUrl ?? ''} alt="Pratinjau dokumentasi" className="mt-2 aspect-[4/3] w-full max-w-md rounded-lg border bg-muted object-contain" />}
            </div>
            <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan…' : journey ? 'Simpan perubahan' : 'Tambah perjalanan'}</Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>Batal</Button>
            </div>
        </form>
    );
}
