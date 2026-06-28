<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sale Report - {{ ucfirst($status) }}</title>
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
            background-color: #0f172a;
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
            color: #0f172a;
        }
        .sale-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .sale-table th,
        .sale-table td {
            border: 1px solid #dee2e6;
            padding: 6px 4px;
            text-align: center;
        }
        .sale-table th {
            background-color: #e9ecef;
            font-weight: bold;
            font-size: 9px;
        }
        .status-paid { color: #0f5132; font-weight: bold; }
        .status-partial { color: #856404; font-weight: bold; }
        .status-pending { color: #842029; font-weight: bold; }
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
    <div class="title">Sale Report</div>
    <div class="subtitle">
        <span class="status-badge">Status: {{ ucfirst($status) }}</span>
        <span>Generated: {{ $currentDateTime }}</span>
    </div>
</div>

@php
    $totalAmount = $sales->sum('total_amount');
    $totalPaid = $sales->sum('paid_amount');
    $totalDue = $sales->sum('due_amount');
    $recordCount = $sales->count();
@endphp

<table class="summary-table">
    <tr>
        <td width="25%"><div class="summary-card"><div class="summary-label">Total Amount</div><div class="summary-value">${{ number_format($totalAmount, 2) }}</div></div></td>
        <td width="25%"><div class="summary-card"><div class="summary-label">Total Paid</div><div class="summary-value">${{ number_format($totalPaid, 2) }}</div></div></td>
        <td width="25%"><div class="summary-card"><div class="summary-label">Total Due</div><div class="summary-value">${{ number_format($totalDue, 2) }}</div></div></td>
        <td width="25%"><div class="summary-card"><div class="summary-label">Records</div><div class="summary-value">{{ $recordCount }}</div></div></td>
    </tr>
</table>

<table class="sale-table">
    <thead>
        <tr>
            <th>#</th><th>Bill No</th><th>Patient</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th><th>Date</th>
        </tr>
    </thead>
    <tbody>
        @forelse($sales as $index => $s)
        <tr>
            <td>{{ $index + 1 }}</td>
            <td>{{ $s->bill_no }}</td>
            <td>{{ $s->patient_name ?? '-' }}</td>
            <td>${{ number_format($s->total_amount ?? 0, 2) }}</td>
            <td>${{ number_format($s->paid_amount ?? 0, 2) }}</td>
            <td>${{ number_format($s->due_amount ?? 0, 2) }}</td>
            <td class="status-{{ $s->payment_status }}">{{ ucfirst($s->payment_status) }}</td>
            <td>{{ \Carbon\Carbon::parse($s->sale_date)->format('Y-m-d') }}</td>
        </tr>
        @empty
        <tr><td colspan="8" style="text-align:center;">No sale records found.</td></tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Report generated from {{ config('app.name') }} - <span>Generated: {{ $currentDateTime }}</span>
</div>
</body>
</html>
