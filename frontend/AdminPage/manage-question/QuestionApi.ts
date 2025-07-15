import axios from 'axios';

export interface QuestionOption {
  text: string;
  correct: boolean;
}

export interface Question {
  questionBankId: string;
  id?: string;
  bankId: string;
  content: string;
  type: 'truefalse' | 'single' | 'multiple';
  level: 'easy' | 'medium' | 'hard';
  options: QuestionOption[];
  answer?: string;
}

const API_URL = 'https://doanln.onrender.com/api/question-banks';

export const fetchQuestions = async (bankId: string): Promise<Question[]> => {
  const response = await axios.get<Question[]>('https://doanln.onrender.com/api/questions', {
    params: { questionBankId: bankId }
  });
  return response.data;
};

export const createQuestion = async (bankId: string, data: Omit<Question, 'id'|'bankId'>): Promise<Question> => {
  const response = await axios.post<Question>('https://doanln.onrender.com/api/questions', {
    ...data,
    questionBankId: bankId
  });
  return response.data;
};

export const updateQuestion = async (id: string, data: Partial<Question>): Promise<Question> => {
  const response = await axios.put<Question>(`https://doanln.onrender.com/api/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (bankId: string, id: string): Promise<void> => {
  await axios.delete('https://doanln.onrender.com/api/questions', {
    params: { id, questionBankId: bankId }
  });
};

export const getQuestionById = async (bankId: string, id: string): Promise<Question> => {
  const response = await axios.get<Question>(`https://doanln.onrender.com/api/questions/${id}`);
  return response.data;
}; 