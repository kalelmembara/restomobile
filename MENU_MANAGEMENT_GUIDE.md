# 🍽️ Menu Management Feature Guide

## 📋 Overview

The Menu Management feature allows restaurant employees to:
- Create and manage menu items (CRUD operations)
- Organize items by categories
- Upload images and descriptions
- Manage menu categories
- Filter and view menus by category

## 🔧 Technical Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: SQLite
- **Port**: 3000
- **API Pattern**: REST

### Frontend
- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ionic Vue
- **Port**: 5173

## 📦 Database Schema

### menu_categories Table
```sql
CREATE TABLE menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Default Categories** (auto-inserted):
- 🍗 Makanan (Main Food)
- 🥤 Minuman (Beverages)
- 🍕 Snack (Snacks)
- 🍰 Dessert (Desserts)
- 💰 Paket Hemat (Discount Packages)

### menus Table
```sql
CREATE TABLE menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
)
```

## 🚀 API Endpoints

### Categories Endpoints

#### Get All Categories
```bash
GET /api/menus/categories
```
Response:
```json
[
  {
    "id": 1,
    "name": "Makanan",
    "icon": "🍗",
    "description": "Menu utama makanan"
  }
]
```

#### Create Category
```bash
POST /api/menus/categories
Content-Type: application/json

{
  "name": "Kategori Baru",
  "description": "Deskripsi kategori (optional)",
  "icon": "🍕"
}
```

#### Delete Category
```bash
DELETE /api/menus/categories/:id
```

### Menu Endpoints

#### Get All Menus
```bash
GET /api/menus
```
Response includes category information (category_name, category_icon)

#### Get Menus by Category
```bash
GET /api/menus/category/:categoryId
```

#### Create Menu
```bash
POST /api/menus
Content-Type: application/json

{
  "name": "Nasi Goreng",
  "categoryId": 1,
  "price": 35000,
  "description": "Nasi goreng dengan bumbu khas (optional)",
  "imageUrl": "https://..." (optional)
}
```

#### Update Menu
```bash
PUT /api/menus/:id
Content-Type: application/json

{
  "name": "Nasi Goreng Updated",
  "categoryId": 1,
  "price": 40000,
  "description": "Updated description",
  "imageUrl": "https://..."
}
```

#### Delete Menu
```bash
DELETE /api/menus/:id
```

## 🎨 Frontend Components

### ManajemenMenuPage.vue
Main container with three tabs:
- **Tambah Menu**: Form to add new menu items
- **Daftar Menu**: Display all menus with filtering
- **Kelola Kategori**: Manage categories

**Location**: `src/views/employee/ManajemenMenuPage.vue`

### MenuFormComponent.vue
Add new menu form component with:
- Menu name input
- Category dropdown selector
- Price input
- Description textarea
- Image URL input with preview
- Category creation modal

**Location**: `src/views/employee/components/MenuFormComponent.vue`

### MenuListComponent.vue
Displays menus in grid layout:
- Responsive grid (250px base width)
- Menu cards with images
- Category badges
- Edit/Delete action buttons
- Loading and empty states

**Location**: `src/views/employee/components/MenuListComponent.vue`

### MenuEditModal.vue
Modal for editing existing menus:
- Pre-populated form fields
- Category selector
- Image preview
- Validation

**Location**: `src/views/employee/components/MenuEditModal.vue`

### CategoryManagementComponent.vue
Manage menu categories:
- Add new category form
- Display all categories
- Delete category functionality

**Location**: `src/views/employee/components/CategoryManagementComponent.vue`

## 🔗 Frontend Service

### menuManagementService.ts

TypeScript service with type-safe API calls:

```typescript
interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

interface Menu {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  price: number;
  description?: string;
  image_url?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// Available methods:
- getCategories()
- addCategory(name, description?, icon?)
- deleteCategory(categoryId)
- getMenus()
- getMenusByCategory(categoryId)
- createMenu(name, categoryId, price, description?, imageUrl?)
- updateMenu(id, name, categoryId, price, description?, imageUrl?)
- deleteMenu(id)
```

**Location**: `src/services/menuManagementService.ts`

## 📱 Navigation

### Access Menu Management:
1. Go to Employee Dashboard: `/employee-dashboard`
2. Click "🍽️ Manajemen Menu" in Quick Actions section
3. Or navigate directly to: `/manajemen-menu`

## ⚙️ Backend Files

### controllers/menuController.js
Handles all menu and category business logic:
- `getCategories()` - Fetch all categories
- `addCategory()` - Create new category
- `deleteCategory()` - Delete category
- `getMenus()` - Fetch all menus with category info
- `getMenusByCategory()` - Filter menus by category
- `createMenu()` - Create new menu item
- `updateMenu()` - Update existing menu
- `deleteMenu()` - Delete menu item

### routes/menus.js
Route definitions:
- `GET /categories` - Get all categories
- `POST /categories` - Add category
- `DELETE /categories/:id` - Delete category
- `GET /` - Get all menus
- `GET /category/:categoryId` - Get menus by category
- `POST /` - Create menu
- `PUT /:id` - Update menu
- `DELETE /:id` - Delete menu

### db.js
SQLite database connection and initialization

### setup-menu-schema.js
Database initialization script:
- Creates menu_categories and menus tables
- Inserts 5 default categories
- Ensures database consistency

## 🧪 Testing

### Verify Backend Setup
```bash
cd backend
node setup-menu-schema.js
```

### Start Backend Server
```bash
cd backend
node server.js
```
Server runs on `http://localhost:3000`

### Test API Endpoints
```bash
# Get categories
curl http://localhost:3000/api/menus/categories

# Get all menus
curl http://localhost:3000/api/menus

# Create menu (example)
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nasi Goreng",
    "categoryId": 1,
    "price": 35000,
    "description": "Nasi goreng dengan bumbu khas"
  }'
```

### Start Frontend Development Server
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🎯 Features

### ✅ Implemented
- [x] Menu CRUD operations
- [x] Category management
- [x] Image URL support with preview
- [x] Form validation
- [x] Responsive grid layout
- [x] Category filtering
- [x] Loading states
- [x] Error handling and toast notifications
- [x] TypeScript type safety
- [x] Dashboard integration

### 📝 Usage Workflow

#### Add New Menu Item
1. Navigate to "Manajemen Menu"
2. Click "Tambah Menu" tab
3. Fill in menu details:
   - Name (required)
   - Category (required)
   - Price in Rp (required)
   - Description (optional)
   - Image URL (optional)
4. Click "Tambah Menu" button
5. Automatically switches to menu list view

#### Edit Existing Menu
1. Go to "Daftar Menu" tab
2. Click blue "Edit" button on menu card
3. Update desired fields in modal
4. Click "Simpan Perubahan"
5. Menu list refreshes automatically

#### Delete Menu
1. In "Daftar Menu" tab
2. Click red "Delete" button on menu card
3. Confirm deletion
4. Menu list updates

#### Add Category
1. Go to "Kelola Kategori" tab
2. Fill in category form:
   - Name (required)
   - Description (optional)
   - Icon/Emoji (optional)
3. Click "Tambah Kategori"
4. Category appears in list

#### Delete Category
1. In "Kelola Kategori" tab
2. Click delete icon on category card
3. Confirm deletion
4. Category is removed

## 🔒 Validation & Error Handling

### Frontend Validation
- Required field checks
- Price must be number
- Image URL format validation
- Toast notifications for errors and success

### Backend Validation
- SQL validation via prepared statements
- Unique category names (UNIQUE constraint)
- Foreign key relationships
- HTTP status code responses:
  - 200: Success
  - 201: Resource created
  - 400: Bad request/validation error
  - 404: Resource not found
  - 500: Server error

## 📊 Response Examples

### Success Response (Create Menu)
```json
{
  "success": true,
  "id": 1,
  "name": "Nasi Goreng",
  "categoryId": 1,
  "price": 35000
}
```

### Error Response
```json
{
  "error": "Menu name is required"
}
```

### Fetch Response (Get Menus)
```json
[
  {
    "id": 1,
    "name": "Nasi Goreng",
    "category_id": 1,
    "category_name": "Makanan",
    "category_icon": "🍗",
    "price": 35000,
    "description": "Nasi goreng dengan bumbu khas",
    "image_url": "https://...",
    "is_active": 1,
    "created_at": "2026-02-28 12:59:05",
    "updated_at": "2026-02-28 12:59:05"
  }
]
```

## 🚀 Deployment Checklist

- [ ] Database tables created (run setup-menu-schema.js)
- [ ] Backend routes registered in server.js
- [ ] Frontend components imported and registered
- [ ] Route added to router configuration
- [ ] Navigation button added to dashboard
- [ ] Environment variables configured (.env.local)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] CORS enabled for correct origin
- [ ] Test all CRUD operations
- [ ] Test category filtering
- [ ] Test image preview functionality
- [ ] Verify error handling and notifications

## 📞 Support & Debugging

### Common Issues

**Issue**: "Endpoint not found" error
- **Solution**: Restart backend server after route changes

**Issue**: Database locked error
- **Solution**: Kill all node processes and restart backend

**Issue**: Port already in use
- **Solution**: 
  ```bash
  # Kill all node processes
  Get-Process -Name "node" | Stop-Process -Force
  # Restart server
  node server.js
  ```

**Issue**: CORS error
- **Solution**: Verify CORS settings in backend server.js
  ```javascript
  app.use(cors, {
    origin: 'http://localhost:5173'
  });
  ```

### Debug Logging
Service has comprehensive logging with emoji prefixes:
- ✅ Success
- ❌ Error
- 📡 Request
- 📝 Update
- 🗑️ Delete

Check browser console and backend logs for troubleshooting.

## 📚 File Structure

```
d:\MobileApp\restoapp\
├── backend/
│   ├── controllers/
│   │   └── menuController.js
│   ├── routes/
│   │   └── menus.js
│   ├── db.js
│   ├── server.js
│   ├── setup-menu-schema.js
│   └── package.json
├── src/
│   ├── services/
│   │   └── menuManagementService.ts
│   ├── views/
│   │   └── employee/
│   │       ├── ManajemenMenuPage.vue
│   │       └── components/
│   │           ├── MenuFormComponent.vue
│   │           ├── MenuListComponent.vue
│   │           ├── MenuEditModal.vue
│   │           └── CategoryManagementComponent.vue
│   └── router/
│       └── index.ts
└── MENU_MANAGEMENT_GUIDE.md (this file)
```

## ✨ Key Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Add Menu | ✅ | With category selector and image preview |
| Edit Menu | ✅ | Modal-based editing with form validation |
| Delete Menu | ✅ | With confirmation dialog |
| Category CRUD | ✅ | Create categories, delete with cascade |
| Image Support | ✅ | URL-based image preview |
| Filtering | ✅ | Filter menus by category |
| Validation | ✅ | Frontend and backend validation |
| Responsive Design | ✅ | Mobile, tablet, desktop optimized |
| Error Handling | ✅ | Toast notifications and user feedback |
| TypeScript | ✅ | Full type safety |

---

**Last Updated**: February 28, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
