<?php

use App\Models\User;

test('the sitemap is public and lists only the canonical homepage', function () {
    $response = $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('https://auth-men.my.id/')
        ->assertDontSee('/projects')
        ->assertDontSee('/journeys')
        ->assertDontSee('/dashboard');

    $xml = new DOMDocument;

    expect($xml->loadXML($response->getContent()))->toBeTrue()
        ->and($xml->documentElement?->tagName)->toBe('urlset');
});

test('robots allows crawling and points to the canonical sitemap', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSeeText('User-agent: *')
        ->assertSeeText('Allow: /')
        ->assertSeeText('Sitemap: https://auth-men.my.id/sitemap.xml');
});

test('the public homepage renders its title and social metadata in the initial html', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('<link rel="canonical" href="https://auth-men.my.id/" data-inertia="canonical">', false)
        ->assertSee('Firman Maulana Syabani | IT Developer</title>', false)
        ->assertSee('<html lang="id"', false)
        ->assertSee('name="description" content="Portofolio Firman Maulana Syabani, IT Developer, yang memuat profil, proyek, perjalanan, dan informasi kontak."', false)
        ->assertSee('property="og:title" content="Firman Maulana Syabani | IT Developer"', false)
        ->assertSee('property="og:description" content="Portofolio Firman Maulana Syabani, IT Developer, yang memuat profil, proyek, perjalanan, dan informasi kontak."', false)
        ->assertSee('property="og:url" content="https://auth-men.my.id/"', false)
        ->assertSee('property="og:image" content="https://auth-men.my.id/images/logo.webp"', false)
        ->assertSee('name="twitter:card" content="summary_large_image"', false)
        ->assertSee('name="twitter:image" content="https://auth-men.my.id/images/logo.webp"', false);
});

test('the homepage emits valid Person and WebSite structured data with an available image', function () {
    $response = $this->get('/')->assertOk();
    preg_match('~<script type="application/ld\+json">(.*?)</script>~s', $response->getContent(), $matches);

    expect($matches)->toHaveKey(1);

    $structuredData = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
    $person = $structuredData['@graph'][0];
    $website = $structuredData['@graph'][1];

    expect($structuredData['@context'])->toBe('https://schema.org')
        ->and($person['@type'])->toBe('Person')
        ->and($person['name'])->toBe('Firman Maulana Syabani')
        ->and($person['jobTitle'])->toBe('IT Developer')
        ->and($person['image'])->toBe('https://auth-men.my.id/images/hero-light.webp')
        ->and($website['@type'])->toBe('WebSite')
        ->and($website['publisher']['@id'])->toBe($person['@id']);

    expect(file_exists(public_path('images/hero-light.webp')))->toBeTrue();
});

test('guests are redirected from cms routes with a noindex header', function (string $path) {
    $this->get($path)
        ->assertRedirect(route('login'))
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
})->with([
    'dashboard' => '/dashboard',
    'projects cms' => '/projects',
    'journeys cms' => '/journeys',
    'menu images cms' => '/menu-images',
]);

test('authenticated cms pages remain accessible and carry a noindex header', function () {
    $this->actingAs(User::factory()->create())
        ->get('/projects')
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
});

test('the login page carries a noindex header', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertDontSee('property="og:title"', false)
        ->assertDontSee('application/ld+json', false);
});

test('production requests redirect to the canonical https host and keep their path', function () {
    $this->app->detectEnvironment(fn (): string => 'production');

    $this->get('http://www.auth-men.my.id/projects?tab=all')
        ->assertMovedPermanently()
        ->assertRedirect('https://auth-men.my.id/projects?tab=all');
});

test('production requests on the canonical https host are not redirected', function () {
    $this->app->detectEnvironment(fn (): string => 'production');

    $this->get('https://auth-men.my.id/')
        ->assertOk();
});
