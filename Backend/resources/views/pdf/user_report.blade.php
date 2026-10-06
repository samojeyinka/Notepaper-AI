<!DOCTYPE html>
<html>

<head>
    <title>User Report</title>
    <style>
        body {
            font-family: sans-serif;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>User Profile Data</h1>
    </div>
    <table>
        <tr>
            <th>Name</th>
            <td>{{ $user->full_name }}</td>
        </tr>
        <tr>
            <th>Email</th>
            <td>{{ $user->email }}</td>
        </tr>
        <tr>
            <th>Joined</th>
            <td>{{ $user->created_at->format('M d, Y') }}</td>
        </tr>
    </table>
</body>

</html>