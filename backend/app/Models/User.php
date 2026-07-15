<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'admin_id',
        'profile_image',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image) {
            return asset('storage/profile-images/' . $this->profile_image);
        }
        return null;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    // Relationship: Admin who created this staff member
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // Relationship: Staff members created by this admin
    public function staffMembers()
    {
        return $this->hasMany(User::class, 'admin_id');
    }

    // Relationship: Medicines created by this admin
    public function medicines()
    {
        return $this->hasMany(Medicine::class, 'admin_id');
    }
}