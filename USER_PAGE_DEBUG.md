# Hướng dẫn Debug - User không hiển thị gì

## 🔍 **Vấn đề đã được sửa**

### **1. Routing Issues:**
- ✅ **Xung đột Router**: Loại bỏ Router trong UserPage để tránh xung đột với App.tsx
- ✅ **Navigation**: Sử dụng React Router navigation thay vì window.location.href
- ✅ **State Management**: Sử dụng state đơn giản để quản lý active section

### **2. CSS Issues:**
- ✅ **Tailwind CSS**: Tạo file index.css với Tailwind directives
- ✅ **Custom Styles**: Thêm custom styles cho sidebar và scrollbar

### **3. Debug Tools:**
- ✅ **Debug UI**: Thêm debug info trong TestList
- ✅ **SimpleTest Component**: Component test đơn giản để kiểm tra render
- ✅ **Console Logging**: Thêm logging chi tiết

## 🚀 **Cách Test và Debug**

### **Bước 1: Khởi động Backend**
```bash
cd DoAnLN/backend
mvn spring-boot:run
```

### **Bước 2: Khởi động Frontend**
```bash
cd DoAnLN/frontend
npm run dev
```

### **Bước 3: Test User Page**
1. Đăng nhập với role "user"
2. Kiểm tra URL: `http://localhost:5173/user`
3. Mở Developer Tools > Console để xem logs

### **Bước 4: Kiểm tra Debug Info**
- Bạn sẽ thấy debug box màu đỏ ở đầu trang
- Nếu thấy "Debug: UserPage is rendering" → UserPage đang hoạt động
- Nếu thấy SimpleTest component → Component đang render

## 🔧 **Các thay đổi chính**

### **UserPage.tsx:**
```typescript
// Loại bỏ Router xung đột
// Sử dụng state management đơn giản
const [activeSection, setActiveSection] = useState<string>('tests');

// Thêm debug logging
useEffect(() => {
  console.log('UserPage mounted with activeSection:', activeSection);
}, [activeSection]);
```

### **TestList.tsx:**
```typescript
// Sử dụng React Router navigation
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

const handleStartTest = (test: Test) => {
  navigate(`/test-taking/${test.id}`);
};
```

### **index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles cho sidebar và scrollbar */
```

## 🐛 **Debug Steps**

### **1. Kiểm tra Console Logs:**
- Mở Developer Tools > Console
- Tìm các log messages:
  - "UserPage mounted with activeSection: tests"
  - "Rendering active section: tests"
  - "Loading available tests..."

### **2. Kiểm tra Network Requests:**
- Mở Developer Tools > Network
- Xem có API calls đến `/api/tests/available` không
- Kiểm tra response status

### **3. Kiểm tra CSS:**
- Đảm bảo Tailwind CSS đã load
- Kiểm tra file index.css có được import không

### **4. Test từng component:**
- SimpleTest component sẽ hiển thị nếu UserPage hoạt động
- Nếu không thấy SimpleTest → Vấn đề với UserPage
- Nếu thấy SimpleTest nhưng không thấy TestList → Vấn đề với API

## 📊 **Expected Results**

### **Nếu mọi thứ hoạt động:**
1. ✅ Thấy debug box màu đỏ
2. ✅ Thấy SimpleTest component (tạm thời)
3. ✅ Sidebar có thể click được
4. ✅ Console có logs

### **Nếu có vấn đề:**
1. ❌ Không thấy gì cả → Vấn đề với routing hoặc CSS
2. ❌ Thấy debug box nhưng không thấy content → Vấn đề với component
3. ❌ Thấy SimpleTest nhưng không thấy TestList → Vấn đề với API

## 🔄 **Next Steps**

### **Sau khi xác nhận UserPage hoạt động:**
1. Thay thế SimpleTest bằng TestList
2. Test API endpoints
3. Tạo dữ liệu mẫu nếu cần

### **Nếu vẫn có vấn đề:**
1. Kiểm tra Firebase connection
2. Kiểm tra CORS configuration
3. Kiểm tra authentication flow

## 📞 **Troubleshooting**

### **Common Issues:**
- **Blank page**: Kiểm tra console errors
- **CSS not loading**: Kiểm tra index.css
- **API errors**: Kiểm tra backend logs
- **Authentication issues**: Kiểm tra Firebase config

### **Debug Commands:**
```bash
# Check if backend is running
curl http://localhost:8080/api/tests/available

# Check if frontend is running
curl http://localhost:5173

# Check console logs
# Open browser DevTools > Console
``` 