import axios from 'axios';

export interface ExamResult {
  id: string;
  userName: string;
  testName: string;
  score: number;
  submittedAt: string;
  status: 'submitted' | 'not_submitted';
  details?: { question: string; answer: string; correct: boolean; point: number }[];
  tabSwitchCount?: number;
}

const API_URL = 'http://localhost:8080/api/exam-results';

export const fetchExamResults = async (): Promise<ExamResult[]> => {
  const response = await axios.get<ExamResult[]>(API_URL);
  return response.data;
};