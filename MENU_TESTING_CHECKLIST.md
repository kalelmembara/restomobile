# 🧪 Menu Management Feature - Testing Checklist

## ✅ Pre-Testing Setup

- [x] Database schema created with 5 default categories
- [x] Backend server running on port 3000
- [x] Frontend development server running on port 5173
- [x] All components created and imported
- [x] Routes configured
- [x] Navigation integrated into dashboard

---

## 🔌 Backend API Testing

### Categories Endpoints

#### ✅ GET /api/menus/categories
```bash
curl http://localhost:3000/api/menus/categories
```
**Expected**: Array of 5 categories with icons
**Status**: ✅ VERIFIED
**Response**: 
```json
[
  {"id":1,"name":"Makanan","icon":"🍗","description":"Menu utama makanan"},
  {"id":2,"name":"Minuman","icon":"🥤","description":"Menu minuman"},
  {"id":3,"name":"Snack","icon":"🍕","description":"Menu snack/cemilan"},
  {"id":4,"name":"Dessert","icon":"🍰","description":"Menu dessert/penutup"},
  {"id":5,"name":"Paket Hemat","icon":"💰","description":"Paket promosi"}
]
```

#### ⏳ POST /api/menus/categories
```bash
# Test creating new category
curl -X POST http://localhost:3000/api/menus/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Kategori Test","description":"Test category","icon":"🧪"}'
```
**Expected**: HTTP 201 with created category data
**Status**: Need to test

#### ⏳ DELETE /api/menus/categories/:id
```bash
# Test deleting category
curl -X DELETE http://localhost:3000/api/menus/categories/6
```
**Expected**: HTTP 200 with success message
**Status**: Need to test

### Menu Endpoints

#### ✅ GET /api/menus
```bash
curl http://localhost:3000/api/menus
```
**Expected**: Array of menus with category information
**Status**: ✅ VERIFIED (1 test menu exists)
**Response**: 
```json
[
  {
    "id":1,
    "name":"Nasi Goreng",
    "price":35000,
    "category_id":1,
    "category_name":"Makanan",
    "category_icon":"🍗",
    "description":"Nasi goreng dengan bumbu khas",
    "image_url":"https://via.placeholder.com/250?text=Nasi+Goreng",
    "is_active":1
  }
]
```

#### ✅ POST /api/menus
```bash
# Test creating menu
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Mie Goreng",
    "categoryId":1,
    "price":30000,
    "description":"Mie goreng dengan telur",
    "imageUrl":"https://via.placeholder.com/250?text=Mie+Goreng"
  }'
```
**Expected**: HTTP 201 with created menu data
**Status**: ✅ VERIFIED (Nasi Goreng successfully created)

#### ⏳ GET /api/menus/category/:categoryId
```bash
# Test filtering by category
curl http://localhost:3000/api/menus/category/1
```
**Expected**: Array of menus in category 1 (Makanan)
**Status**: Need to test with frontend

#### ⏳ PUT /api/menus/:id
```bash
# Test updating menu
curl -X PUT http://localhost:3000/api/menus/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Nasi Goreng Updated",
    "categoryId":1,
    "price":40000,
    "description":"Updated description"
  }'
```
**Expected**: HTTP 200 with updated menu data
**Status**: Need to test

#### ⏳ DELETE /api/menus/:id
```bash
# Test deleting menu
curl -X DELETE http://localhost:3000/api/menus/1
```
**Expected**: HTTP 200 with success message
**Status**: Need to test

---

## 🎨 Frontend Component Testing

### 1. ManajemenMenuPage Navigation
**Test**: 
- [ ] Click "🍽️ Manajemen Menu" button on Employee Dashboard
- [ ] Page loads successfully
- [ ] All 3 tabs visible: "Tambah Menu", "Daftar Menu", "Kelola Kategori"
- [ ] Tab switching works smoothly

**Location**: Employee Dashboard → Quick Actions

### 2. MenuFormComponent (Tab: Tambah Menu)
**Test**:
- [ ] Form displays all fields:
  - [ ] Name input field
  - [ ] Category dropdown (shows 5 categories)
  - [ ] Price input field
  - [ ] Description textarea
  - [ ] Image URL input
- [ ] "Tambah Kategori Baru" button visible
- [ ] Image preview works when URL entered
- [ ] Form validation:
  - [ ] Cannot submit empty name
  - [ ] Cannot submit without category
  - [ ] Cannot submit without price
- [ ] Submit button labeled "Tambah Menu"
- [ ] After successful submit:
  - [ ] Toast shows "✅ Menu berhasil ditambahkan!"
  - [ ] Page switches to "Daftar Menu" tab
  - [ ] New menu appears in list

### 3. MenuListComponent (Tab: Daftar Menu)
**Test**:
- [ ] Menu grid displays with responsive layout
- [ ] Each menu card shows:
  - [ ] Menu name
  - [ ] Menu image (or placeholder)
  - [ ] Category badge (e.g., "🍗 Makanan")
  - [ ] Price in IDR format (Rp 35.000)
  - [ ] Description snippet (truncated)
  - [ ] Edit button (blue)
  - [ ] Delete button (red)
- [ ] Category filter dropdown:
  - [ ] "Semua Kategori" shows all menus
  - [ ] Selecting category filters menus
  - [ ] Filter works correctly
- [ ] Empty state displays when no menus

### 4. MenuEditModal
**Test**:
- [ ] Click Edit button on menu card
- [ ] Modal opens with:
  - [ ] Header "Edit Menu"
  - [ ] Close button (X)
  - [ ] Form pre-filled with current menu data
  - [ ] Image preview showing current image
- [ ] Edit menu details:
  - [ ] Change name
  - [ ] Change category
  - [ ] Change price
  - [ ] Update description
  - [ ] Update image URL
- [ ] Save button updates menu:
  - [ ] Toast shows "✅ Menu berhasil diperbarui!"
  - [ ] Modal closes
  - [ ] List refreshes with new data
- [ ] Cancel button closes without saving

### 5. Menu Delete Functionality
**Test**:
- [ ] Click Delete button on menu card
- [ ] Confirmation dialog appears
- [ ] Confirm deletion:
  - [ ] Toast shows "✅ Menu berhasil dihapus!"
  - [ ] Menu disappears from list
- [ ] Cancel deletion:
  - [ ] No changes made
  - [ ] Dialog closes

### 6. CategoryManagementComponent (Tab: Kelola Kategori)
**Test**:
- [ ] Add category form displays:
  - [ ] Name input (required)
  - [ ] Description input (optional)
  - [ ] Icon/Emoji input (optional)
  - [ ] "Tambah Kategori" button
- [ ] Add new category:
  - [ ] Submit with valid data
  - [ ] Toast shows "✅ Kategori berhasil ditambahkan!"
  - [ ] Form clears
  - [ ] Category appears in list below
- [ ] Categories list displays:
  - [ ] All 5 default categories
  - [ ] Any newly added categories
  - [ ] Each with icon display
  - [ ] Delete button on each
- [ ] Delete category:
  - [ ] Confirmation dialog appears
  - [ ] Confirm deletion
  - [ ] Toast shows "✅ Kategori berhasil dihapus!"
  - [ ] Category removed from list

---

## 🔄 Integration Testing

### Navigation Flow
**Test**:
- [ ] From Employee Dashboard:
  - [ ] Click "Manajemen Menu"
  - [ ] Page loads completely
  - [ ] Back button works and returns to dashboard
- [ ] Tab switching:
  - [ ] "Tambah Menu" → Add form appears
  - [ ] "Daftar Menu" → Menu list appears
  - [ ] "Kelola Kategori" → Category management appears
- [ ] Cross-tab consistency:
  - [ ] Add menu in "Tambah Menu"
  - [ ] New menu visible in "Daftar Menu"
  - [ ] Category updates reflected in dropdown

### Data Persistence
**Test**:
- [ ] Add menu item
- [ ] Refresh page (F5)
- [ ] Menu still exists in list
- [ ] Add category
- [ ] Refresh page
- [ ] Category still appears in dropdown

### Error Handling
**Test**:
- [ ] Try duplicate category name:
  - [ ] Error toast appears
  - [ ] Form not submitted
- [ ] Try invalid image URL:
  - [ ] No error (URL accepted as-is)
  - [ ] Placeholder shows if URL invalid
- [ ] Try empty required fields:
  - [ ] Form validation prevents submission
- [ ] Network error (simulate):
  - [ ] Error toast appears
  - [ ] Helpful message shown

---

## 🎯 User Experience Testing

### Responsive Design
**Test on different screen sizes**:
- [ ] Desktop (1920x1080):
  - [ ] Grid shows multiple columns
  - [ ] All elements visible
  - [ ] No horizontal scroll
- [ ] Tablet (768x1024):
  - [ ] Grid adjusts to tablet layout
  - [ ] Touch targets adequate (44px min)
- [ ] Mobile (375x667):
  - [ ] Single column layout
  - [ ] All content accessible
  - [ ] No layout breaks

### Performance
**Test**:
- [ ] Page loads in < 2 seconds
- [ ] Form submission < 1 second response
- [ ] Image preview loads smoothly
- [ ] List filters quickly
- [ ] No lag when scrolling

### Accessibility
**Test**:
- [ ] Tab navigation through form fields
- [ ] Keyboard submit (Enter key)
- [ ] Form labels associated with inputs
- [ ] Color contrast adequate
- [ ] Icons have alt text / labels

---

## 📊 Data Validation Testing

### Frontend Validation
- [ ] Name field:
  - [ ] No special characters allowed (check if needed)
  - [ ] Max length enforced (if any)
- [ ] Price field:
  - [ ] Only accepts numbers
  - [ ] Negative values not allowed (if enforced)
- [ ] URL field:
  - [ ] Accepts valid URLs
  - [ ] Handles https and http
- [ ] Category field:
  - [ ] Dropdown only allows existing categories
  - [ ] Cannot submit without selection

### Backend Validation
- [ ] Duplicate category names rejected (UNIQUE constraint)
- [ ] Menu without name rejected
- [ ] Invalid price rejected
- [ ] Category ID must exist
- [ ] All error responses have proper HTTP status

---

## 🐛 Bug Testing

**Known Issues to Test**:
- [ ] No known issues at this time

**Test Scenarios**:
- [ ] Rapid clicking buttons (no duplicate submissions)
- [ ] Quick navigation between tabs
- [ ] Closing modal while saving
- [ ] Multiple simultaneous requests
- [ ] Very long text in name/description fields
- [ ] Special characters in text fields
- [ ] Very large image URLs
- [ ] Connection timeout handling

---

## 📝 Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| API Categories | ✅ | GET working, CREATE/DELETE need frontend test |
| API Menus | ✅ | GET working, CREATE verified, others need test |
| ManajemenMenuPage | ⏳ | Needs frontend testing |
| MenuFormComponent | ⏳ | Needs frontend testing |
| MenuListComponent | ⏳ | Needs frontend testing |
| MenuEditModal | ⏳ | Needs frontend testing |
| CategoryManagement | ⏳ | Needs frontend testing |
| Navigation | ⏳ | Needs end-to-end testing |
| Responsive Design | ⏳ | Needs browser testing |

---

## 🚀 Testing Commands

### Quick Test Server
```bash
# 1. Setup database
cd backend
node setup-menu-schema.js

# 2. Start backend
node server.js

# 3. In another terminal, start frontend
cd ..
npm run dev

# 4. Open browser: http://localhost:5173
```

### API Testing with curl
```bash
# Get categories
curl http://localhost:3000/api/menus/categories

# Get all menus
curl http://localhost:3000/api/menus

# Create menu
curl -X POST http://localhost:3000/api/menus \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","categoryId":1,"price":25000}'

# Delete menu
curl -X DELETE http://localhost:3000/api/menus/1
```

---

## ✅ Sign-off Checklist

- [ ] All API endpoints tested and working
- [ ] Frontend components render correctly
- [ ] Navigation works end-to-end
- [ ] Add menu workflow complete
- [ ] Edit menu workflow complete
- [ ] Delete menu workflow complete
- [ ] Category management working
- [ ] Filtering by category works
- [ ] Responsive design verified
- [ ] Error handling verified
- [ ] Data persistence verified
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable
- [ ] Documentation complete

---

## 📞 Testing Environment

**Date**: February 28, 2026
**Tester**: [Your Name]
**Backend**: Node.js v20.16.0, port 3000
**Frontend**: Vite, port 5173
**Database**: SQLite resto.db
**Browser**: Chrome/Firefox/Safari (specify)

---

**Status**: Ready for Testing ✅
**Next Steps**: Execute frontend testing and sign off checklist
