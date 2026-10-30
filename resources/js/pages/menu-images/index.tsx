import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, ManagedMenuImage, MenuImageSide } from '@/types';
import * as menuImageRoutes from '@/routes/menu-images';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gambar Menu', href: menuImageRoutes.index() },
];

function MenuImageForm({ side, image }: { side: MenuImageSide; image?: ManagedMenuImage }) {
    const form = useForm<{ side: MenuImageSide; image: File | null; images: File[]; _method?: 'put' }>({
        side,
        image: null,
        images: [],
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const selectedFiles = image ? (form.data.image ? [form.data.image] : []) : form.data.images;

        if (selectedFiles.length === 0) {
            setPreviewUrls([]);
            return;
        }

        const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(objectUrls);
        return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    }, [form.data.image, form.data.images, image]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (image) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(menuImageRoutes.update(image.id).url, { forceFormData: true });
            return;
        }

        form.post(menuImageRoutes.store().url, {
            forceFormData: true,
            onSuccess: () => form.reset('images'),
        });
    };

    return (
        <form onSubmit={submit} className="flex min-w-64 items-end gap-3">
            {image && <input type="hidden" name="side" value={form.data.side} />}
            <div className="grid min-w-0 flex-1 gap-2">
                <Label htmlFor={`${side}-image-${image?.id ?? 'new'}`}>
                    {image ? 'Pilih gambar pengganti' : 'Tambah gambar'}
                </Label>
                <Input
                    id={`${side}-image-${image?.id ?? 'new'}`}
                    name={image ? 'image' : 'images[]'}
                    type="file"
                    multiple={!image}
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        if (image) {
                            form.setData('image', files[0] ?? null);
                        } else {
                            form.setData('images', files);
                        }
                    }}
                />
                <InputError message={form.errors.image ?? form.errors.images ?? form.errors['images.0']} />
                {form.progress && (
                    <progress className="w-full" value={form.progress.percentage} max="100">
                        {form.progress.percentage}%
                    </progress>
                )}
                {previewUrls.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                        {previewUrls.map((previewUrl) => (
                            <img key={previewUrl} src={previewUrl} alt="Pratinjau gambar yang dipilih" className="h-16 w-24 object-cover" />
                        ))}
                    </div>
                )}
            </div>
            <Button type="submit" size="sm" disabled={Boolean(form.processing)}>
                <Upload />
                {form.processing ? 'Menyimpan…' : image ? 'Ganti' : `Tambah${form.data.images.length > 1 ? ` (${form.data.images.length})` : ''}`}
            </Button>
        </form>
    );
}

function ImageSection({
    side,
    images,
}: {
    side: MenuImageSide;
    images: ManagedMenuImage[];
}) {
    const title = side === 'left' ? 'Card kiri' : 'Card kanan';
    const removeImage = (image: ManagedMenuImage) => {
        if (window.confirm(`Hapus gambar dari ${title.toLowerCase()}?`)) {
            router.delete(menuImageRoutes.destroy(image.id).url);
        }
    };

    return (
        <section className="grid gap-5 rounded-xl border p-4 md:p-6" aria-labelledby={`${side}-images-title`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 id={`${side}-images-title`} className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        Gambar pada kolom {side === 'left' ? 'kiri' : 'kanan'} yang bergerak otomatis di menu.
                    </p>
                </div>
                <MenuImageForm side={side} />
            </div>

            {images.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[620px] text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-medium">Gambar</th>
                                <th scope="col" className="px-4 py-3 font-medium">Ganti gambar</th>
                                <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {images.map((image, index) => (
                                <tr key={image.id} className="bg-card">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                                            <img src={image.imageUrl} alt={`${title} ${index + 1}`} className="h-16 w-24 border bg-muted object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><MenuImageForm side={side} image={image} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(image)}>
                                            <Trash2 /> Hapus
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    <ImagePlus className="size-4" />
                    Belum ada gambar khusus untuk card ini. Gambar bawaan masih ditampilkan.
                </div>
            )}
        </section>
    );
}

export default function MenuImagesIndex({ images }: { images: ManagedMenuImage[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gambar Menu" />
            <Head><meta name="robots" content="noindex, nofollow" /></Head>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Gambar Card Menu</h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola gambar yang bergerak otomatis pada kolom kiri dan kanan menu utama.
                    </p>
                </div>
                <ImageSection side="left" images={images.filter((image) => image.side === 'left')} />
                <ImageSection side="right" images={images.filter((image) => image.side === 'right')} />
            </div>
        </AppLayout>
    );
}

MenuImagesIndex.layout = { breadcrumbs };
