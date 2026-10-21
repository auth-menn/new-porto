<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('unknown web pages render the Inertia not found page', function (string $url) {
    $this->get($url)
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/404')
        );
})->with([
    '/register',
    '/user/confirm-password',
    '/forgot-password',
    '/reset-password/invalid-token',
    '/email/verify',
    '/settings/profile',
    '/two-factor-challenge',
    '/unknown-page',
]);

test('unknown JSON endpoints keep a JSON not found response', function () {
    $this->getJson('/unknown-page')
        ->assertNotFound()
        ->assertJson(['message' => 'Not Found']);
});

test('missing models render the Inertia not found page', function () {
    Route::get('/missing-model', function () {
        throw new ModelNotFoundException;
    });

    $this->get('/missing-model')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('errors/404'));
});
