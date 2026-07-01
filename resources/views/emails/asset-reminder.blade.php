<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asset Return Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #f36f21;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .asset-details {
            background: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #f36f21;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            background: #f36f21;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 Asset Return Reminder</h2>
        </div>

        <div class="content">
            <p>Dear <strong>{{ $user->name }}</strong>,</p>

            <p>This is a friendly reminder that you have an asset that is overdue for return.</p>

            <div class="asset-details">
                <h3>Asset Details:</h3>
                <p><strong>Asset ID:</strong> {{ $assignment->asset->asset_id ?? 'N/A' }}</p>
                <p><strong>Product Name:</strong> {{ $assignment->asset->product_name ?? 'N/A' }}</p>
                <p><strong>Category:</strong> {{ $assignment->asset->category->name ?? 'N/A' }}</p>
                <p><strong>Assigned Date:</strong> {{ \Carbon\Carbon::parse($assignment->assigned_at)->format('d M Y') }}</p>
                <p><strong>Expected Return Date:</strong> {{ $expectedReturnDate->format('d M Y') }}</p>
            </div>

            @if($daysOverdue > 0)
            <div class="warning">
                <p>⚠️ <strong>This asset is {{ $daysOverdue }} day(s) overdue.</strong></p>
                <p>Please return the asset as soon as possible to avoid any inconvenience.</p>
            </div>
            @endif

            <p>If you have any questions or need to extend the loan period, please contact the system administrator.</p>

            <p>Thank you for your cooperation.</p>

            <div class="footer">
                <p>This is an automated message from the Nova Asset Management System.</p>
                <p>Please do not reply directly to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>