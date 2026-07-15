<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Medicine extends Model
{
    protected $fillable = [
        'generic',
        'brand',
        'dosage',
        'strength',
        'route',
        'stock',
        'purchase_price',
        'selling_price',
        'expiry_date',
        'batch_number',
        'admin_id',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'stock' => 'integer',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    // Add stock
    public function addStock($quantity)
    {
        $this->stock += $quantity;
        $this->save();
        return $this;
    }

    // Remove stock
    public function removeStock($quantity)
    {
        if ($this->stock < $quantity) {
            throw new \Exception('Insufficient stock. Available: ' . $this->stock . ', Requested: ' . $quantity);
        }
        $this->stock -= $quantity;
        $this->save();
        return $this;
    }

    // Check if stock is available
    public function hasStock($quantity)
    {
        return $this->stock >= $quantity;
    }

    // Check if medicine is expired
    public function getIsExpiredAttribute()
    {
        if (!$this->expiry_date) return false;
        return Carbon::now()->greaterThan($this->expiry_date);
    }

    // Check if medicine is near expiry (within 30 days)
    public function getIsNearExpiryAttribute()
    {
        if (!$this->expiry_date) return false;
        $daysUntilExpiry = Carbon::now()->diffInDays($this->expiry_date, false);
        return $daysUntilExpiry >= 0 && $daysUntilExpiry <= 30;
    }

    // Get days until expiry
    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) return null;
        return Carbon::now()->diffInDays($this->expiry_date, false);
    }

    // Get expiry status label
    public function getExpiryStatusAttribute()
    {
        if (!$this->expiry_date) return ['label' => 'No Date', 'color' => 'bg-gray-100 text-gray-800'];
        
        if ($this->is_expired) {
            return ['label' => 'Expired', 'color' => 'bg-red-100 text-red-800'];
        }
        
        if ($this->is_near_expiry) {
            return ['label' => 'Near Expiry (' . $this->days_until_expiry . ' days)', 'color' => 'bg-yellow-100 text-yellow-800'];
        }
        
        return ['label' => 'Valid', 'color' => 'bg-green-100 text-green-800'];
    }

    // Calculate profit per unit
    public function getProfitPerUnitAttribute()
    {
        return ($this->selling_price ?? 0) - ($this->purchase_price ?? 0);
    }

    // Calculate profit margin percentage
    public function getProfitMarginAttribute()
    {
        if ($this->purchase_price <= 0) return 0;
        return (($this->selling_price - $this->purchase_price) / $this->purchase_price) * 100;
    }

    // Get stock status
    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) return 'out_of_stock';
        if ($this->stock <= 5) return 'low_stock';
        return 'in_stock';
    }

    public function getStockStatusLabelAttribute()
    {
        $labels = [
            'out_of_stock' => 'Out of Stock',
            'low_stock' => 'Low Stock',
            'in_stock' => 'In Stock',
        ];
        return $labels[$this->stock_status] ?? 'Unknown';
    }

    public function getStockStatusColorAttribute()
    {
        $colors = [
            'out_of_stock' => 'bg-red-100 text-red-800',
            'low_stock' => 'bg-yellow-100 text-yellow-800',
            'in_stock' => 'bg-green-100 text-green-800',
        ];
        return $colors[$this->stock_status] ?? 'bg-gray-100 text-gray-800';
    }
}