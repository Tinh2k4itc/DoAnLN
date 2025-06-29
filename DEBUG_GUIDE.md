# Hướng dẫn Debug - Vấn đề User không thể lấy được bài thi

## 🔍 **Vấn đề đã được sửa**

### **1. Backend Issues:**
- ✅ **Thiếu ID**: Các method `getAllTests()`, `getActiveTests()`, `getTestsByCourse()` không set ID cho test objects
- ✅ **Error Handling**: Cải thiện logging và error handling trong TestController
- ✅ **API Endpoint**: Thêm endpoint `/api/tests/available` để lấy bài thi khả dụng cho học sinh

### **2. Frontend Issues:**
- ✅ **API Call**: Cập nhật TestList component sử dụng `fetchAvailableTests()` thay vì `fetchActiveTests()`
- ✅ **Error Handling**: Cải thiện error handling và thêm debug logging
- ✅ **Date Formatting**: Thêm try-catch cho date formatting

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

### **Bước 3: Test API trực tiếp**
1. Mở file `DoAnLN/frontend/test-api.html` trong browser
2. Click "Create Sample Data" để tạo dữ liệu mẫu
3. Test các endpoint:
   - "Get All Tests" - Lấy tất cả bài thi
   - "Get Active Tests" - Lấy bài thi đang hoạt động
   - "Get Available Tests" - Lấy bài thi khả dụng cho học sinh

### **Bước 4: Test Frontend**
1. Đăng nhập với role "user"
2. Vào trang danh sách bài thi
3. Kiểm tra console log để xem debug info

## 🔧 **Các thay đổi chính**

### **Backend Changes:**

#### **TestService.java:**
```java
// Sửa method getAllTests()
public List<Test> getAllTests() throws ExecutionException, InterruptedException {
    List<Test> tests = new ArrayList<>();
    CollectionReference testCollection = firestore.collection(COLLECTION_NAME);
    for (QueryDocumentSnapshot document : testCollection.get().get().getDocuments()) {
        Test test = document.toObject(Test.class);
        if (test != null) {
            test.setId(document.getId()); // ✅ Thêm ID
            tests.add(test);
        }
    }
    return tests;
}

// Thêm method getAvailableTests()
public List<Test> getAvailableTests() throws ExecutionException, InterruptedException {
    // Lấy bài thi đang hoạt động và trong thời gian cho phép
}
```

#### **TestController.java:**
```java
// Thêm endpoint mới
@GetMapping("/available")
public ResponseEntity<List<Test>> getAvailableTests() {
    // Lấy bài thi khả dụng cho học sinh
}

// Thêm endpoint tạo dữ liệu mẫu
@PostMapping("/sample-data")
public ResponseEntity<String> createSampleData() {
    // Tạo dữ liệu mẫu cho testing
}
```

### **Frontend Changes:**

#### **TestApi.ts:**
```typescript
// Thêm function mới
export const fetchAvailableTests = async (): Promise<Test[]> => {
    // Lấy bài thi khả dụng từ API
}
```

#### **TestList.tsx:**
```typescript
// Cập nhật import
import { fetchAvailableTests, Test } from '../AdminPage/manage-test/TestApi';

// Cập nhật API call
const testData = await fetchAvailableTests();
```

## 🐛 **Debug Tips**

### **1. Kiểm tra Console Logs:**
- Backend: Xem logs trong terminal khi chạy Spring Boot
- Frontend: Mở Developer Tools > Console

### **2. Kiểm tra Network Requests:**
- Mở Developer Tools > Network
- Xem các API calls đến `/api/tests/available`

### **3. Kiểm tra Database:**
- Đảm bảo có bài thi với `isActive: true`
- Kiểm tra thời gian `startDate` và `endDate`

### **4. Common Issues:**
- **CORS Error**: Kiểm tra `@CrossOrigin` trong controller
- **Firebase Connection**: Kiểm tra `serviceAccountKey.json`
- **Port Issues**: Đảm bảo backend chạy trên port 8080

## 📊 **Dữ liệu mẫu được tạo**

Khi click "Create Sample Data", hệ thống sẽ tạo 3 bài thi mẫu:

1. **Bài thi Java** - Đang mở (30 phút, 10 câu)
2. **Bài thi Database** - Đang mở (45 phút, 15 câu)  
3. **Bài thi Web** - Chưa mở (sẽ mở sau 7 ngày)

## 🎯 **Kết quả mong đợi**

Sau khi sửa, user sẽ có thể:
- ✅ Xem danh sách bài thi khả dụng
- ✅ Lọc bài thi theo môn học
- ✅ Tìm kiếm bài thi
- ✅ Bắt đầu làm bài thi (nếu trong thời gian cho phép)
- ✅ Xem trạng thái bài thi (Đang mở/Chưa mở/Đã kết thúc)

## 📞 **Hỗ trợ**

Nếu vẫn gặp vấn đề:
1. Kiểm tra logs trong console
2. Test API trực tiếp qua `test-api.html`
3. Đảm bảo Firebase connection hoạt động
4. Kiểm tra CORS configuration 