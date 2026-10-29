<?php

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Support\Facades\Hash;

test('admin seeding is idempotent and the configured account can log in', function () {
    config([
        'admin.name' => 'Test Admin',
        'admin.email' => 'admin@test.local',
        'admin.password' => 'a-long-test-password-123',
    ]);

    $this->seed(AdminSeeder::class);
    $this->seed(AdminSeeder::class);

    $admin = User::where('email', 'admin@test.local')->firstOrFail();
    $this->assertDatabaseCount('users', 1);
    expect(Hash::check('a-long-test-password-123', $admin->password))->toBeTrue();
    expect($admin->email_verified_at)->not->toBeNull();

    $this->post(route('login.store'), [
        'email' => 'admin@test.local',
        'password' => 'a-long-test-password-123',
    ])->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($admin);
});

test('admin seeding rejects a missing password before creating a user', function () {
    config([
        'admin.name' => 'Test Admin',
        'admin.email' => 'admin@test.local',
        'admin.password' => null,
    ]);

    expect(fn () => $this->seed(AdminSeeder::class))->toThrow(
        RuntimeException::class,
        'ADMIN_PASSWORD must be set in .env and be at least 12 characters.',
    );
    $this->assertDatabaseCount('users', 0);
});
