import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <>
            <Head title="404">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
                <p className="text-sm font-semibold tracking-widest text-muted-foreground">
                    404
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Halaman tidak ditemukan
                </h1>
                <Button asChild>
                    <Link href="/">Kembali ke beranda</Link>
                </Button>
            </main>
        </>
    );
}
