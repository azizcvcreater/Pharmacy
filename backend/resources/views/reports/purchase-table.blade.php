<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Purchase Report - {{ ucfirst($status) }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 1.2cm;
            @bottom-right {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 9px;
                color: #6c757d;
            }
        }
        body {
            font-family: 'DejaVu Sans', 'Helvetica', sans-serif;
            font-size: 10px;
            color: #212529;
            margin: 0;
            padding: 0;
        }
        .header {
            background-color: #1e3a8a;
            color: white;
            padding: 12px 15px;
            margin-bottom: 15px;
        }
        .company-name {
            font-size: 11px;
            margin-bottom: 4px;
        }
        .title {
            font-size: 22px;
            font-weight: bold;
        }
        .subtitle {
            margin-top: 8px;
            font-size: 10px;
            display: flex;
            justify-content: space-between;
        }
        .status-badge {
            background-color: rgba(255,255,255,0.2);
            padding: 2px 10px;
            display: inline-block;
        }
        .summary-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 5px;
        }
        .summary-card {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: center;
        }
        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #6c757d;
            font-weight: bold;
        }
        .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
        }
        .purchase-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .purchase-table th,
        .purchase-table td {
            border: 1px solid #dee2e6;
            padding: 6px 4px;
            text-align: center;
        }
        .purchase-table th {
            background-color: #e9ecef;
            font-weight: bold;
            font-size: 9px;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 8px;
            font-weight: bold;
            text-transform: capitalize;
        }
        .badge-paid { background-color: #d1e7dd; color: #0f5132; }
        .badge-partial { background-color: #fff3cd; color: #856404; }
        .badge-pending { background-color: #f8d7da; color: #842029; }
        .footer {
            margin-top: 15px;
            text-align: right;
            font-size: 8px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 5px;
        }
    </style>
</head>
<body>
<div class="header">
    <div class="company-name">{{ config('app.name', 'Company Name') }}</div>
    <div class="title">Purchase Report</div>
    <div class="subtitle">
        <span class="status-badge">Status: {{ ucfirst($status) }}</span>
        <span>Generated: {{ $currentDateTime }}</span>
    </div>
</div>

@php
    $totalCost = $purchases->sum('details_sum_total_buyer_price');
    $totalProfit = $purchases->sum('details_sum_total_profit');
    $totalAmount = $purchases->sum('total_amount');
    $totalPaid = $purchases->sum('paid_amount');
    $totalDue = $purchases->sum('due_amount');
    $recordCount = $purchases->count();
@endphp

<table class="summary-table">
    <tr>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Total Cost</div><div class="summary-value">${{ number_format($totalCost, 2) }}</div></div></td>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Total Profit</div><div class="summary-value">${{ number_format($totalProfit, 2) }}</div></div></td>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Total Amount</div><div class="summary-value">${{ number_format($totalAmount, 2) }}</div></div></td>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Total Paid</div><div class="summary-value">${{ number_format($totalPaid, 2) }}</div></div></td>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Total Due</div><div class="summary-value">${{ number_format($totalDue, 2) }}</div></div></td>
        <td width="16.66%"><div class="summary-card"><div class="summary-label">Records</div><div class="summary-value">{{ $recordCount }}</div></div></td>
    </tr>
</table>

<table class="purchase-table">
    <thead>
        <tr>
            <th>#</th><th>Bill No</th><th>Total Cost</th><th>Total Profit</th><th>Total Amount</th><th>Paid</th><th>Due</th><th>Status</th><th>Date</th>
        </tr>
    </thead>
    <tbody>
        @forelse($purchases as $index => $p)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $p->bill_no }}</td>
            <td>${{ number_format($p->details_sum_total_buyer_price ?? 0, 2) }}</td>
            <td>${{ number_format($p->details_sum_total_profit ?? 0, 2) }}</td>
            <td>${{ number_format($p->total_amount ?? 0, 2) }}</td>
            <td>${{ number_format($p->paid_amount ?? 0, 2) }}</td>
            <td>${{ number_format($p->due_amount ?? 0, 2) }}</td>
            <td>
                @php
                    $statusClass = match($p->payment_status) {
                        'paid' => 'badge-paid',
                        'partial' => 'badge-partial',
                        default => 'badge-pending'
                    };
                @endphp
                <span class="badge {{ $statusClass }}">{{ ucfirst($p->payment_status) }}</span>
            </td>
            <td>{{ \Carbon\Carbon::parse($p->purchase_date)->format('Y-m-d') }}</td>
        </tr>
        @empty
        <tr><td colspan="9" style="text-align:center;">No purchase records found.</td></tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Report generated from {{ config('app.name') }} - <span>Generated: {{ $currentDateTime }}</span>
</div>
</body>
</html>
