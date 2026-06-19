# Page Permissions System - User Guide

## Overview

The Page Permissions system allows administrators to control CRUD (Create, Read, Update, Delete) access for individual users on specific pages within the Nova AMS application. This provides fine-grained access control beyond the existing role-based permission system.

## Features

- **Per-User CRUD Control**: Grant or revoke specific permissions (create, read, update, delete) for individual users on specific pages
- **Module-Based Organization**: Pages are organized by modules for easier management
- **Bulk Operations**: Copy permissions between users, bulk update permissions
- **Integration**: Works seamlessly with existing Spatie Laravel Permission system
- **Admin Override**: Users with 'Admin' role automatically have all permissions

## Database Structure

### Tables

1. **page_permissions**: Stores available pages and their metadata
   - `id`: Unique identifier
   - `name`: Page name (e.g., 'assets', 'licenses')
   - `route`: Route path (e.g., '/assets', '/licenses')
   - `description`: Page description
   - `module`: Associated module (e.g., 'module.asset-inventory')
   - `active`: Whether the page is active

2. **user_page_permissions**: Stores user-specific permissions
   - `user_id`: Foreign key to users table
   - `page_permission_id`: Foreign key to page_permissions table
   - `can_create`: Boolean permission for creating
   - `can_read`: Boolean permission for reading
   - `can_update`: Boolean permission for updating
   - `can_delete`: Boolean permission for deleting

## Access the Page Permissions Admin

1. Navigate to **Admin Settings** in the main menu
2. Click on **Page Permissions** (purple shield icon)
3. You'll see the Page Permissions Management interface

## How to Use

### 1. Select a User

- Browse the users list on the left panel
- Click on a user to load their current permissions
- Users are filtered by search and can be filtered by module

### 2. Manage Permissions

- Once a user is selected, you'll see all available pages organized by module
- Each page shows 4 permission toggles:
  - **Create**: Allow creating new records
  - **Read**: Allow viewing records
  - **Update**: Allow editing existing records
  - **Delete**: Allow deleting records

- Click the toggle buttons to grant or revoke permissions:
  - Green checkmark = Permission granted
  - Red X = Permission denied

### 3. Save Changes

- Click the "Save Changes" button when done
- A success message will confirm the updates
- The page will reload to reflect the changes

### 4. Copy Permissions

To copy all permissions from one user to another:

1. Click the "Copy Permissions" button in the top right
2. Select the source user (copy from)
3. Select the target user (copy to)
4. Click "Copy Permissions"

**Note**: This will overwrite all existing permissions for the target user.

## Middleware Integration

Use the `pagePermission` middleware in your routes to enforce permissions:

```php
// In routes/web.php

Route::middleware(['pagePermission:create,assets'])->group(function () {
    Route::post('/assets', [AssetController::class, 'store']);
});

Route::middleware(['pagePermission:update,licenses'])->group(function () {
    Route::put('/licenses/{id}', [LicenseController::class, 'update']);
});
```

### Middleware Parameters

- **First parameter**: The CRUD permission to check (`create`, `read`, `update`, `delete`)
- **Second parameter (optional)**: The page name. If not provided, it's derived from the route

### Programmatic Permission Checks

In your controllers or models:

```php
// Check if user has specific permission
if (auth()->user()->hasPagePermission('assets', 'create')) {
    // User can create assets
}

// Get all permissions for a page
$permissions = auth()->user()->getPagePermissions('licenses');
// Returns: ['create', 'read', 'update'] (whatever they have)

// Set a permission programmatically
auth()->user()->setPagePermission('assets', 'delete', true);
```

## API Endpoints

### User Management Endpoints

- `GET /admin/page-permissions` - Main page permissions interface
- `GET /admin/page-permissions/user/{user}` - Get user's permissions (JSON)
- `POST /admin/page-permissions/user/{user}` - Update user's permissions
- `POST /admin/page-permissions/bulk` - Bulk update permissions
- `POST /admin/page-permissions/copy` - Copy permissions between users
- `GET /admin/page-permissions/stats` - Get permission statistics

### Example API Response

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["Site Manager"]
  },
  "permissions": [
    {
      "id": 1,
      "name": "assets",
      "route": "/assets",
      "description": "Asset management",
      "module": "module.asset-inventory",
      "permissions": {
        "can_create": true,
        "can_read": true,
        "can_update": false,
        "can_delete": false
      }
    }
  ]
}
```

## Available Pages

The system includes pages for all major modules:

- **Asset Inventory**: assets, licenses, live-tracking, withdrawals
- **Master Data**: master-data, vendors
- **Multi-Site**: multi-site-tracking, multi-site-dashboards, multi-site-transfers
- **Operations**: operations-maintenance, spare-parts
- **Analytics**: analytics-utilization, analytics-costs, analytics-availability
- **Finance**: finance-valuation, finance-budgets
- **Documents**: documents-assets, documents-maintenance
- **System Settings**: settings, admin-sites, security-roles, users, etc.

## Admin Override

Users with the `Admin` role automatically have all permissions on all pages. This cannot be revoked and is checked first before any individual permissions.

## Security Features

- **Audit Logging**: All denied access attempts are logged with user details, IP, and timestamp
- **Cascading Deletes**: When a user is deleted, their page permissions are automatically removed
- **Transaction Safety**: All permission updates use database transactions to ensure data integrity
- **Active Pages Only**: Only active pages are shown in the permission interface

## Best Practices

1. **Principle of Least Privilege**: Grant only the minimum permissions needed
2. **Regular Audits**: Periodically review user permissions
3. **Use Roles**: Use role-based permissions for general access, page permissions for exceptions
4. **Test Changes**: Test permission changes with the affected users
5. **Document Exceptions**: Document why specific users have unusual permission patterns

## Troubleshooting

### User can't access a page despite having permissions

1. Check if the page is active in `page_permissions` table
2. Verify the user doesn't have the Admin role (which overrides everything)
3. Check middleware is applied correctly in routes
4. Review logs for denied access attempts

### Permission changes not taking effect

1. Clear application cache: `php artisan cache:clear`
2. Clear permission cache: `php artisan permission:cache-reset`
3. Check browser cache if using the interface
4. Verify database transaction completed successfully

### Performance Considerations

- Page permissions are cached per request
- Admin users bypass permission checks (faster)
- Consider using role-based permissions for large user groups
- Regular permission audits help maintain security

## Database Commands

### Check existing permissions

```bash
# See all page permissions
php artisan tinker
>>> \App\Models\PagePermission::all(['name', 'route'])

# See user permissions
>>> \App\Models\User::find(1)->pagePermissions
>>> \App\Models\User::find(1)->getPagePermissions('assets')
```

### Manual permission updates

```bash
# Grant permission
php artisan tinker
>>> $user = \App\Models\User::find(1);
>>> $user->setPagePermission('assets', 'create', true);

# Check permission
>>> $user->hasPagePermission('assets', 'create')
```

## Future Enhancements

Potential features for future versions:

- Permission templates for quick user setup
- Bulk import/export of permissions
- Permission expiration dates
- Temporary permission grants
- Advanced reporting and analytics
- Integration with approval workflows

## Support

For issues or questions about the Page Permissions system:

1. Check this guide first
2. Review the database structure
3. Check application logs
4. Test with the API endpoints
5. Contact system administrator

## Version History

- **v1.0** (2026-06-19): Initial implementation
  - Per-user CRUD permissions
  - Module-based organization
  - Copy permissions feature
  - Admin override
  - Audit logging