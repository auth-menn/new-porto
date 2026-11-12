/**
 * resources/js/lib/venom-transition.ts
 *
 * Efek symbiote untuk pergantian tema. Mandiri (tanpa state React):
 * cairan keluar dari tombol toggle -> menyelimuti viewport -> tema diganti -> cairan surut.
 *
 * Pemakaian:
 *   void playVenomTransition(buttonEl, () => updateAppearance('dark'), { color: '#000000' });
 */

type VenomOptions = {
    /**
     * 'cover'   = ke mode gelap: cairan menyebar, tema berganti saat layar hampir tertutup, selesai.
     * 'retreat' = ke mode terang: tema berganti langsung, cairan surut dan menampakkan tema baru.
     */
    mode?: 'cover' | 'retreat';
    coverMs?: number;
    retreatMs?: number;
    fadeOutMs?: number;
    color?: string;
    maxSize?: number;
    outsideContainer?: HTMLElement | null;
    outsideColor?: string;
    originPoint?: { x: number; y: number };
    /** Jika diisi, venom dirender di dalam elemen ini (terpotong oleh clip-path-nya). */
    container?: HTMLElement | null;
};

type Renderer = {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    loc: Record<string, WebGLUniformLocation | null>;
};

const VERTEX_SHADER = `#version 300 es
void main() {
    vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uO;
uniform vec2 uC;
uniform vec3 uBase;
uniform float uP;
uniform float uT;
uniform float uR;
out vec4 outputColor;
float h1(vec2 p) {
    p = fract(p * vec2(0.1031, 0.1030));
    p += dot(p, p.yx + 33.33);
    return fract((p.x + p.y) * p.x);
}
vec2 h2(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    q += dot(q, q.yzx + 33.33);
    return fract((q.xx + q.yz) * q.zy);
}
float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x),
        mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}
float rdg(float n, float k) {
    return pow(1.0 - abs(2.0 * n - 1.0), k);
}
void main() {
    vec2 f = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
    vec2 u = (f - uO) / uR;
    float d = length(u);
    vec2 v = u - uC;
    float a = atan(v.y, v.x) - 1.5708;
    float r = length(v);
    float a2 = a + (vn(vec2(a * 2.0 + 3.0, r * 3.0)) - 0.5) * 0.5;
    float vein = 0.65 * rdg(vn(vec2(a2 * 4.5, r * 1.5 + 2.0)), 5.0)
        + 0.4 * rdg(vn(vec2(a2 * 10.5 + 7.0, r * 3.2)), 6.0)
        + 0.35 * rdg(vn(vec2(a2 * 26.0 + 3.0, r * 9.0)), 9.0)
        + 0.2 * rdg(vn(vec2(a2 * 55.0, r * 16.0 + 4.0)), 12.0);
    float front = d + 0.26 * (vn(u * 3.8 + 9.0) * 0.65 + vn(u * 8.0 + 2.0) * 0.35 - 0.5)
        - 0.7 * min(1.0, vein) * min(1.0, d * 5.0);
    front += 0.02 * (vn(u * 70.0) * 0.6 + vn(u * 150.0) * 0.4 - 0.5);
    vec2 w = u * 5.2;
    w += 0.45 * vec2(vn(w * 0.6 + uT * 0.02), vn(w * 0.6 + 7.0 - uT * 0.02)) - 0.22;
    vec2 g = floor(w), fr = fract(w);
    float f1 = 8.0, f2 = 8.0, id = 0.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 b = vec2(float(i), float(j));
            vec2 q = b + h2(g + b) - fr;
            float dd = dot(q, q);
            if (dd < f1) { f2 = f1; f1 = dd; id = h1(g + b); }
            else if (dd < f2) { f2 = dd; }
        }
    }
    float e = sqrt(f2) - sqrt(f1);
    float T = front + (0.12 + 0.28 * id) * smoothstep(0.03, 0.4, e);
    float th = -0.8 + 2.9 * uP;
    float gg = th - T;
    float px = fwidth(gg) * 1.3 + 0.0008;
    float al = smoothstep(0.0, px, gg);
    al *= mix(0.5, 1.0, smoothstep(0.0, 0.05, gg));
    vec2 dp = u * 22.0, dg = floor(dp), dc = h2(dg) * 0.7 + 0.15;
    float dr = 0.07 + 0.1 * h1(dg + 5.0);
    vec2 dl = fract(dp) - dc;
    float dist = length(dl);
    float aD = step(0.86, h1(dg + 2.0)) * step(0.12, d)
        * step(d - 0.1 - 0.25 * h1(dg + 9.0), th)
        * (1.0 - smoothstep(dr - 0.03, dr, dist));
        float sgn = dot(uBase, vec3(0.3333)) > 0.5 ? -1.0 : 1.0;
    vec3 dcol = uBase
        + sgn * vec3(0.8, 0.85, 0.95) * 0.7
        * smoothstep(dr * 0.55, 0.0, length(dl - vec2(-0.35, -0.35) * dr));
    float vis = 1.0 - smoothstep(0.05, 0.5, gg);
    float tex = vn(u * 38.0) * 0.6 + vn(u * 77.0) * 0.4;
    float hg = exp(-e * 8.0) + 0.35 * vn(u * 55.0) + 0.25 * vn(u * 14.0 + 2.0);
    vec3 N = normalize(vec3(-dFdx(hg) * 9.0, -dFdy(hg) * 9.0, 1.0));
    float nd = max(dot(N, normalize(vec3(-0.5, -0.6, 0.65))), 0.0);
    float spec = pow(max(dot(N, normalize(vec3(-0.35, -0.45, 1.0))), 0.0), 90.0);
    float rim = pow(1.0 - N.z, 1.5);
    float edge = exp(-pow((gg - 0.015) / 0.008, 2.0));
    float lip = exp(-pow((gg - 0.04) / 0.025, 2.0)) * pow(vn(u * 120.0), 2.0);
    vec3 col = uBase
        + sgn * vec3(0.045, 0.05, 0.065) * nd * nd * vis
        + sgn * vec3(0.55, 0.6, 0.7) * spec * vis * 1.5
        + sgn * vec3(0.2, 0.22, 0.28) * rim * vis * 0.6;
    col += sgn * vec3(0.8, 0.85, 0.95) * edge * (0.5 + tex)
        + sgn * vec3(0.5, 0.55, 0.65) * lip * 0.9;
    col += sgn * vec3(0.05) * (1.0 - smoothstep(0.0, 0.05, gg));
    col = clamp(col, 0.0, 1.0);
    dcol = clamp(dcol, 0.0, 1.0);
    float alpha = max(al, aD);
    vec3 color = mix(dcol, col, step(aD, al));
    outputColor = vec4(color * alpha, alpha);
}`;

let renderer: Renderer | null = null;
let outsideRenderer: Renderer | null = null;
let initFailed = false;
let busy = false;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);

    if (!shader) {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
    const gl = canvas.getContext('webgl2', {
        premultipliedAlpha: true,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
    });
    const program = gl?.createProgram();

    if (!gl || !program) {
        return null;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertex || !fragment) {
        return null;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return null;
    }

    gl.useProgram(program);

    const loc: Renderer['loc'] = {};
    for (const name of ['uRes', 'uO', 'uC', 'uBase', 'uP', 'uT', 'uR']) {
        loc[name] = gl.getUniformLocation(program, name);
    }

    return { canvas, gl, loc };
}

function createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.venomCanvas = 'true';
    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
        display: 'none',
        willChange: 'opacity',
    });

    return canvas;
}

function init(): Renderer | null {
    if (renderer) {
        return renderer;
    }

    if (initFailed || typeof document === 'undefined') {
        return null;
    }

    const canvas = createCanvas();
    renderer = createRenderer(canvas);

    if (!renderer) {
        initFailed = true;
        return null;
    }

    document.body.appendChild(canvas);

    return renderer;
}

function initOutside(): Renderer | null {
    if (outsideRenderer) {
        return outsideRenderer;
    }

    outsideRenderer = createRenderer(createCanvas());

    return outsideRenderer;
}

function hexToRgb(color: string): [number, number, number] {
    let hex = color.replace('#', '');

    if (hex.length === 3) {
        hex = hex.replace(/./g, '$&$&');
    }

    const n = Number.parseInt(hex, 16) || 0;

    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function layout(r: Renderer, origin: HTMLElement, options: VenomOptions) {
    const { canvas, gl, loc } = r;
    const box = options.container?.getBoundingClientRect();
    const left = box?.left ?? 0;
    const top = box?.top ?? 0;
    const width = box?.width ?? window.innerWidth;
    const height = box?.height ?? window.innerHeight;
    const scale = Math.min(1, (options.maxSize ?? 900) / Math.max(width, height));

    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);

    const rect = origin.getBoundingClientRect();
    const ox = options.originPoint
        ? options.originPoint.x * width * scale
        : (rect.left + rect.width / 2 - left) * scale;
    const oy = options.originPoint
        ? options.originPoint.y * height * scale
        : (rect.top + rect.height / 2 - top) * scale;
    const radius = Math.max(
        Math.hypot(ox, oy),
        Math.hypot(canvas.width - ox, oy),
        Math.hypot(ox, canvas.height - oy),
        Math.hypot(canvas.width - ox, canvas.height - oy),
    );
    const [red, green, blue] = hexToRgb(options.color ?? '#050507');

    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform2f(loc.uO, ox, oy);
    gl.uniform1f(loc.uR, radius);
    // pusat urat sejajar tombol tapi di atas layar -> urat menjalar ke bawah dan samping
    gl.uniform2f(loc.uC, 0, (-40 * scale - oy) / radius);
    gl.uniform3f(loc.uBase, red, green, blue);
}

function draw(r: Renderer, progress: number, time: number) {
    const { gl, loc } = r;

    gl.uniform1f(loc.uP, progress);
    gl.uniform1f(loc.uT, time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const SWAP_AT_PROGRESS = 0.4;

function run(
    r: Renderer,
    from: number,
    to: number,
    duration: number,
    onFrame?: (progress: number) => void,
    outside?: { renderer: Renderer; origin: HTMLElement; options: VenomOptions },
    onSlow?: () => void,
) {
    return new Promise<void>((resolve) => {
        const startedAt = performance.now();
        let last = startedAt;
        let sum = 0;
        let count = 0;
        let checked = false;

        const frame = (now: number) => {
            if (!checked) {
                if (count > 0) {
                    sum += now - last;
                }

                last = now;
                count += 1;

                if (count === 10) {
                    checked = true;

                    if (sum / 9 > 26) {
                        onSlow?.();
                    }
                }
            }

            const t = Math.min(1, (now - startedAt) / duration);
            const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
            const progress = from + (to - from) * eased;

            draw(r, progress, now / 1000);
            if (outside) {
                draw(outside.renderer, progress, now / 1000);
            }
            onFrame?.(progress);

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        };

        requestAnimationFrame(frame);
    });
}

function wait(ms: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function fadeCanvas(canvas: HTMLCanvasElement, to: number, ms: number) {
    canvas.style.transition = `opacity ${ms}ms ease`;
    void canvas.offsetWidth;
    canvas.style.opacity = String(to);
    await wait(ms);
}

function mount(r: Renderer, container: HTMLElement | null) {
    const { canvas } = r;

    if (container) {
        // di dalam panel: di atas background panel, di bawah konten (prepend = elemen pertama)
        Object.assign(canvas.style, { position: 'absolute', zIndex: '0' });
        container.prepend(canvas);
    } else {
        Object.assign(canvas.style, { position: 'fixed', zIndex: '-1' });

        if (canvas.parentElement !== document.body) {
            document.body.appendChild(canvas);
        }
    }
}

// tunggu beberapa frame supaya React & CSS selesai menerapkan tema sebelum canvas dilepas
function nextFrames(count = 2) {
    return new Promise<void>((resolve) => {
        let left = count;
        const step = () => {
            left -= 1;

            if (left <= 0) {
                resolve();
            } else {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    });
}

export function warmUpVenomTransition() {
    init();
}

export async function playVenomTransition(
    origin: HTMLElement,
    applyTheme: () => void,
    options: VenomOptions = {},
): Promise<boolean> {
    if (busy) {
        return false;
    }

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    const r = reducedMotion ? null : init();

    if (!r) {
        applyTheme();

        return true;
    }

    busy = true;
    const root = document.documentElement;
    const { canvas } = r;
    const mode = options.mode ?? 'cover';
    const container = options.container ?? null;
    const outsideContainer = options.outsideContainer ?? null;
    const outside = outsideContainer ? initOutside() : null;
    const originRect = origin.getBoundingClientRect();
    const outsideRect = outsideContainer?.getBoundingClientRect();
    const originX = outsideRect?.width
        ? (originRect.left + originRect.width / 2 - outsideRect.left) /
          outsideRect.width
        : 0.5;
    const originY = outsideRect?.height
        ? (originRect.top + originRect.height / 2 - outsideRect.top) /
          outsideRect.height
        : 0.5;
    const outsideOptions = {
        ...options,
        container: outsideContainer,
        color: options.outsideColor ?? '#000000',
        originPoint: {
            x: Math.max(0, Math.min(1, 1 - originX)),
            y: Math.max(0, Math.min(1, 1 - originY)),
        },
    };
    let maxSize = options.maxSize;
let lastProgress = 0;
let lastW = window.innerWidth;

const relayout = () => {
    layout(r, origin, { ...options, maxSize });
    if (outside) {
        layout(outside, origin, { ...outsideOptions, maxSize });
    }
    // gambar ulang seketika agar canvas tidak kosong 1 frame
    const t = performance.now() / 1000;
    draw(r, lastProgress, t);
    if (outside) draw(outside, lastProgress, t);
};

const onResize = () => {
    // abaikan resize yang hanya mengubah tinggi (bar alamat mobile)
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    relayout();
};

    mount(r, container);
    if (outside && outsideContainer) {
        mount(outside, outsideContainer);
    }
    root.dataset.venomScope = container ? 'panel' : 'full';
    root.dataset.venomActive =
        (options.color ?? '#050507').toLowerCase() === '#ffffff'
            ? 'light'
            : 'dark';
    layout(r, origin, options);
    canvas.style.display = 'block';
    if (outside) {
        layout(outside, origin, outsideOptions);
        outside.canvas.style.display = 'block';
    }
    window.addEventListener('resize', onResize);

    try {
                if (mode === 'cover') {
            // pertahankan warna LAMA (panel atau <html>) agar tampil di belakang venom
            const holder = container ?? root;
            holder.style.backgroundColor = getComputedStyle(holder).backgroundColor;
            root.style.setProperty('--venom-old-bg', getComputedStyle(holder).backgroundColor);

            let swapped = false;

            await run(
                r,
                0,
                1,
                options.coverMs ?? 3000,
                (progress) => {
                    lastProgress = progress;
                    if (!swapped && progress >= SWAP_AT_PROGRESS) {
                        swapped = true;
                        window.setTimeout(applyTheme, 0);
                    }
                },
                outside
                    ? { renderer: outside, origin, options: outsideOptions }
                    : undefined,
                () => {
                    maxSize = 560;
                    relayout();
                },
            );

            if (!swapped) {
                applyTheme();
            }

            // canvas kini menutup layar penuh dengan warna tema baru,
            // jadi latar di belakangnya diganti ke warna yang sama (tidak terlihat)
            const newBg = options.color ?? '#000000';
            holder.style.backgroundColor = newBg;
            if (outsideContainer) {
                outsideContainer.style.backgroundColor = options.outsideColor ?? '#000000';
            }
            await nextFrames(2);

            // canvas memudar pelan di atas latar baru -> tidak ada lompatan warna
            await Promise.all([
                fadeCanvas(canvas, 0, options.fadeOutMs ?? 900),
                ...(outside
                    ? [fadeCanvas(outside.canvas, 0, options.fadeOutMs ?? 900)]
                    : []),
            ]);
        } else {
            canvas.style.opacity = '0';
            draw(r, 1, 0);
            await fadeCanvas(canvas, 1, 150);
            applyTheme();

            let released = false;

            await run(r, 1, 0, options.retreatMs ?? 3200, (progress) => {
                if (!released && progress < 0.15) {
                    released = true;
                    delete root.dataset.venomActive;
                }
            });
        }

        return true;
    } catch {
        return false;
    } finally {
        // tahan transisi CSS tetap mati selama pelepasan, supaya background
        // tidak memudar dari transparent -> warna tema (penyebab lama + blink)
        root.dataset.venomSettle = 'true';

        canvas.style.display = 'none';
        canvas.style.opacity = '1';
        canvas.style.transition = '';
        root.style.removeProperty('--venom-old-bg');
        // background-color inline dihapus di dalam rAF di bawah (setelah tema settle)
        if (outside) {
            outside.canvas.style.display = 'none';
            outside.canvas.style.opacity = '1';
            outside.canvas.style.transition = '';
            document.body.appendChild(outside.canvas);
        }

        if (container) {
            document.body.appendChild(canvas);
        }

        delete root.dataset.venomScope;
        delete root.dataset.venomActive;
        window.removeEventListener('resize', onResize);
        busy = false;

       requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                root.style.removeProperty('background-color');
                container?.style.removeProperty('background-color');
                outsideContainer?.style.removeProperty('background-color');
                delete root.dataset.venomSettle;
                // beri tahu header/ScrollTrigger bahwa tema sudah final (lihat Bug 2)
                window.dispatchEvent(new Event('venom-settled'));
            }),
        );
    }
}

// Mode View Transition: bentuk venom dipakai sebagai mask untuk snapshot tema BARU.
async function playViewTransition(
    origin: HTMLElement,
    applyTheme: () => void,
    options: VenomOptions,
): Promise<boolean> {
    const r = init();

    if (!r) {
        applyTheme();

        return true;
    }

    busy = true;

    const root = document.documentElement;
    const duration = options.coverMs ?? 3000;
    const style = document.createElement('style');
    let lastUrl: string | null = null;
    let pending = false;

    const setMask = (image: string) => {
        style.textContent = `
::view-transition-group(root){animation:none}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
::view-transition-new(root){
  -webkit-mask-image:${image};mask-image:${image};
  -webkit-mask-size:100% 100%;mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}`;
    };

    // mask awal transparan penuh -> tidak ada kedipan tema baru di frame pertama
    setMask('linear-gradient(transparent,transparent)');
    document.head.appendChild(style);
    // matikan transisi CSS 500ms supaya snapshot baru langsung berwarna final
    root.dataset.venomVt = 'true';
    layout(r, origin, { ...options, maxSize: options.maxSize ?? 640 });

    let stopped = false;

    // decode gambar dulu, baru dipasang sebagai mask (mencegah mask kosong/kedip)
    const pushMask = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;

        img.decode()
            .then(() => {
                if (stopped) {
                    URL.revokeObjectURL(url);

                    return;
                }

                setMask(`url("${url}")`);

                const previous = lastUrl;
                lastUrl = url;

                if (previous) {
                    // jangan revoke langsung, beri waktu browser selesai memakainya
                    window.setTimeout(() => URL.revokeObjectURL(previous), 400);
                }
            })
            .catch(() => URL.revokeObjectURL(url));
    };

    const transition = document.startViewTransition(() => {
        applyTheme();
    });

    try {
        await transition.ready;

        // tahan transisi tetap hidup selama animasi (animation:none akan membuatnya selesai seketika)
        root.animate(
            { opacity: [1, 1] },
            { duration: duration + 200, pseudoElement: '::view-transition-new(root)' },
        );

        const startedAt = performance.now();

        await new Promise<void>((resolve) => {
            const frame = (now: number) => {
                const t = Math.min(1, (now - startedAt) / duration);
                const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);

                draw(r, eased, now / 1000);

                // toBlob harus dipanggil di task yang sama dengan draw()
                if (!pending) {
                    pending = true;
                    r.canvas.toBlob((blob) => {
                        pending = false;

                        if (blob) {
                            pushMask(blob);
                        }
                    });
                }

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(frame);
        });

        return true;
    } catch (error) {
        console.warn('[venom] view transition gagal:', error);

        return false;
    } finally {
        stopped = true;
        transition.skipTransition();
        style.remove();
        delete root.dataset.venomVt;

        if (lastUrl) {
            const finalUrl = lastUrl;
            window.setTimeout(() => URL.revokeObjectURL(finalUrl), 400);
        }

        busy = false;
    }
}
