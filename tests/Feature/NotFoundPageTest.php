<?php

use Inertia\Testing\AssertableInertia as Assert;

test('unknown web pages render the Inertia not found page', function (string $url) {
    $this->get($url)
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/404')
        );
})->with([
    '/register',
    '/forgot-password',
    '/reset-password/invalid-token',
    '/email/verify',
    '/settings/profile',
    '/user/confirm-password',
    '/two-factor-challenge',
    '/unknown-page',
]);

test('unknown JSON endpoints keep a JSON not found response', function () {
    $this->getJson('/unknown-page')
        ->assertNotFound()
        ->assertJson(['message' => 'Not Found']);
});
