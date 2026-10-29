import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Project } from '@/types';
import * as projectRoutes from '@/routes/projects';

type ProjectFormData = {
    title: string;
    laptop_image: File | null;
    mobile_image: File | null;
    link: string;
    _method?: 'put';
};

export function ProjectForm({ project }: { project?: Project }) {
    const form = useForm<ProjectFormData>({
        title: project?.title ?? '',
        laptop_image: null,
        mobile_image: null,
        link: project?.link ?? '',
    });
    const [laptopPreview, setLaptopPreview] = useState<string | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.laptop_image) {
            setLaptopPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(form.data.laptop_image);
        setLaptopPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.laptop_image]);

    useEffect(() => {
        if (!form.data.mobile_image) {
            setMobilePreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(form.data.mobile_image);
        setMobilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [form.data.mobile_image]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (project) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(projectRoutes.update(project.id).url, {
                forceFormData: true,
            });
            return;
        }

        form.post(projectRoutes.store().url, { forceFormData: true });
    };

    return (
        <form onSubmit={submit} className="grid max-w-3xl gap-6">
            <div className="grid gap-2">
                <Label htmlFor="title">Nama proyek</Label>
                <Input
                    id="title"
                    value={form.data.title}
                    onChange={(event) => form.setData('title', event.target.value)}
                    required
                    maxLength={255}
                />
                <InputError message={form.errors.title} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid content-start gap-2">
                    <Label htmlFor="laptop_image">Gambar laptop {project ? '(opsional untuk diganti)' : '*'}</Label>
                    <Input
                        id="laptop_image"
                        name="laptop_image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required={!project}
                        onChange={(event) => form.setData('laptop_image', event.target.files?.[0] ?? null)}
                    />
                    <p className="text-sm text-muted-foreground">JPG, PNG, atau WebP. Maksimal 5 MB.</p>
                    <InputError message={form.errors.laptop_image} />
                    {(laptopPreview || project?.laptopImageUrl) && (
                        <img src={laptopPreview ?? project?.laptopImageUrl} alt="Pratinjau gambar laptop" className="mt-2 aspect-video w-full rounded-lg border bg-muted object-contain" />
                    )}
                </div>
                <div className="grid content-start gap-2">
                    <Label htmlFor="mobile_image">Gambar mobile {project ? '(opsional untuk diganti)' : '*'}</Label>
                    <Input
                        id="mobile_image"
                        name="mobile_image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required={!project}
                        onChange={(event) => form.setData('mobile_image', event.target.files?.[0] ?? null)}
                    />
                    <p className="text-sm text-muted-foreground">JPG, PNG, atau WebP. Maksimal 5 MB.</p>
                    <InputError message={form.errors.mobile_image} />
                    {(mobilePreview || project?.mobileImageUrl) && (
                        <img src={mobilePreview ?? project?.mobileImageUrl} alt="Pratinjau gambar mobile" className="mt-2 aspect-video w-full rounded-lg border bg-muted object-contain" />
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="link">Link domain (opsional)</Label>
                <Input
                    id="link"
                    type="url"
                    value={form.data.link}
                    onChange={(event) => form.setData('link', event.target.value)}
                    placeholder="https://contoh.com"
                    maxLength={2048}
                />
                <InputError message={form.errors.link} />
            </div>

            <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Menyimpan…' : project ? 'Simpan perubahan' : 'Tambah proyek'}
                </Button>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
