import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <>
            <Head title="404">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
                <svg
                    className="not-found-face"
                    viewBox="0 0 320 380"
                    role="img"
                    aria-label="Animasi wajah 404 yang melihat ke samping dan berkedip"
                >
                    <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="25"
                    >
                        <g
                            className="not-found-face__eyes"
                            transform="translate(0, 112.5)"
                        >
                            <g transform="translate(15, 0)">
                                <polyline
                                    className="not-found-face__eye-lid"
                                    points="37,0 0,120 75,120"
                                />
                                <polyline
                                    className="not-found-face__pupil"
                                    points="55,120 55,155"
                                    strokeDasharray="35 35"
                                />
                            </g>
                            <g transform="translate(230, 0)">
                                <polyline
                                    className="not-found-face__eye-lid"
                                    points="37,0 0,120 75,120"
                                />
                                <polyline
                                    className="not-found-face__pupil"
                                    points="55,120 55,155"
                                    strokeDasharray="35 35"
                                />
                            </g>
                        </g>
                        <rect
                            className="not-found-face__nose"
                            rx="4"
                            ry="4"
                            x="132.5"
                            y="112.5"
                            width="55"
                            height="155"
                        />
                        <g
                            strokeDasharray="102 102"
                            transform="translate(65, 334)"
                        >
                            <path
                                className="not-found-face__mouth-left"
                                d="M 0 30 C 0 30 40 0 95 0"
                                strokeDashoffset="-102"
                            />
                            <path
                                className="not-found-face__mouth-right"
                                d="M 95 0 C 150 0 190 30 190 30"
                                strokeDashoffset="102"
                            />
                        </g>
                    </g>
                </svg>
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
