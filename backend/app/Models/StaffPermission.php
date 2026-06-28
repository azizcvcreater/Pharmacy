<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffPermission extends Model
{
    protected $fillable = [
        'staff_id',
        'can_edit_delete',
        'updated_by',
    ];

    public $timestamps = false;

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
