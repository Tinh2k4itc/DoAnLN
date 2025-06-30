import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tests';

export interface Test {
  id?: string;
  name: string;
  description: string;
  courseId: string;
  courseName: string;
  partId: string;
  partName: string;
  questionBankId: string;
  questionBankName: string;
  totalQuestions: number;
  timeLimit: number;
  totalScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  showAnswers?: boolean;
  questions?: TestQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestQuestion {
  questionId: string;
  content: string;
  type: string;
  level: string;
  score: number;
  options: Array<{
    text: string;
    correct: boolean;
  }>;
}

// Lấy tất cả bài thi
export const fetchTests = async (): Promise<Test[]> => {
  try {
    console.log('Fetching all tests from:', API_URL);
    const res = await axios.get<Test[]>(API_URL);
    console.log('All tests fetched successfully:', res.data.length, 'tests');
    return res.data;
  } catch (error) {
    console.error('Error fetching all tests:', error);
    throw error;
  }
};

// Lấy bài thi theo ID
export const fetchTestById = async (id: string): Promise<Test> => {
  try {
    console.log('Fetching test by ID:', id);
    const res = await axios.get<Test>(`${API_URL}/${id}`);
    console.log('Test fetched successfully:', res.data.name);
    return res.data;
  } catch (error) {
    console.error('Error fetching test by ID:', id, error);
    throw error;
  }
};

// Tạo bài thi mới
export const createTest = async (test: Omit<Test, 'id'>): Promise<Test> => {
  try {
    console.log('Creating new test:', test.name);
    const res = await axios.post<Test>(API_URL, test);
    console.log('Test created successfully:', res.data.id);
    return res.data;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
};

// Cập nhật bài thi
export const updateTest = async (id: string, test: Partial<Test>): Promise<Test> => {
  try {
    console.log('Updating test:', id);
    const res = await axios.put<Test>(`${API_URL}/${id}`, test);
    console.log('Test updated successfully');
    return res.data;
  } catch (error) {
    console.error('Error updating test:', id, error);
    throw error;
  }
};

// Xóa bài thi
export const deleteTest = async (id: string): Promise<void> => {
  try {
    console.log('Deleting test:', id);
    await axios.delete(`${API_URL}/${id}`);
    console.log('Test deleted successfully');
  } catch (error) {
    console.error('Error deleting test:', id, error);
    throw error;
  }
};

// Bật/tắt trạng thái bài thi
export const toggleTestStatus = async (id: string, isActive: boolean): Promise<Test> => {
  try {
    console.log('Toggling test status:', id, 'to', isActive);
    const res = await axios.patch<Test>(`${API_URL}/${id}/status`, { isActive });
    console.log('Test status updated successfully');
    return res.data;
  } catch (error) {
    console.error('Error toggling test status:', id, error);
    throw error;
  }
};

// Lấy bài thi theo môn học
export const fetchTestsByCourse = async (courseId: string): Promise<Test[]> => {
  try {
    console.log('Fetching tests by course:', courseId);
    const res = await axios.get<Test[]>(`${API_URL}/course/${courseId}`);
    console.log('Tests by course fetched successfully:', res.data.length, 'tests');
    return res.data;
  } catch (error) {
    console.error('Error fetching tests by course:', courseId, error);
    throw error;
  }
};

// Lấy bài thi đang hoạt động
export const fetchActiveTests = async (): Promise<Test[]> => {
  try {
    console.log('Fetching active tests from:', `${API_URL}/active`);
    const res = await axios.get<Test[]>(`${API_URL}/active`);
    console.log('Active tests fetched successfully:', res.data.length, 'tests');
    return res.data;
  } catch (error) {
    console.error('Error fetching active tests:', error);
    throw error;
  }
};

// Lấy bài thi khả dụng cho học sinh (đang hoạt động và trong thời gian cho phép)
export const fetchAvailableTests = async (): Promise<Test[]> => {
  try {
    console.log('Fetching available tests from:', `${API_URL}/available`);
    const res = await axios.get<Test[]>(`${API_URL}/available`);
    console.log('Available tests fetched successfully:', res.data.length, 'tests');
    return res.data;
  } catch (error) {
    console.error('Error fetching available tests:', error);
    throw error;
  }
};

// Lấy bài thi cho học sinh (bao gồm kiểm tra thời gian và trạng thái)
export const fetchTestForStudent = async (id: string): Promise<Test> => {
  try {
    console.log('Fetching test for student:', id);
    const res = await axios.get<Test>(`${API_URL}/${id}/user`);
    console.log('Test for student fetched successfully');
    return res.data;
  } catch (error) {
    console.error('Error fetching test for student:', id, error);
    throw error;
  }
}; 