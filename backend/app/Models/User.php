<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'admin_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    public function staff()
    {
        return $this->hasMany(User::class, 'admin_id');
    }


    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function staffPermission()
    {
        return $this->hasOne(StaffPermission::class, 'staff_id');
    }


    public function scopeStaffOf($query, $adminId)
    {
        return $query->where('admin_id', $adminId)
                     ->where('role', 'staff');
    }


    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isStaff()
    {
        return $this->role === 'staff';
    }
}
