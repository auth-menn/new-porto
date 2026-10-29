<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = config('admin.name');
        $email = config('admin.email');
        $password = config('admin.password');

        if (! is_string($name) || trim($name) === '') {
            throw new RuntimeException('ADMIN_NAME must be set in .env.');
        }

        if (! is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new RuntimeException('ADMIN_EMAIL must be a valid email address.');
        }

        if (! is_string($password) || strlen($password) < 12) {
            throw new RuntimeException('ADMIN_PASSWORD must be set in .env and be at least 12 characters.');
        }

        $admin = User::unguarded(fn (): User => User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'email_verified_at' => now(),
            ],
        ));

        $status = $admin->wasRecentlyCreated ? 'created' : 'updated';
        $this->command?->info("Admin user {$status}: {$email}");
    }
}
