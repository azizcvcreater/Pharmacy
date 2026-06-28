<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */


    public function run(){
        User::firstOrCreate(
            ['email' => 'azizziar1405@gmail.com'],
            [
                'name' => 'Super Admin Aziz Ziar',
                'password' => Hash::make('azizziar1405@gmail.com'),
                'role' => 'super_admin',
                'pharmacy_id' => null
            ]
        );
    }
}
