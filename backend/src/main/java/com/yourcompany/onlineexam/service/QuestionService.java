package com.yourcompany.onlineexam.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.yourcompany.onlineexam.model.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.Map;

@Service
public class QuestionService {
    private static final String COLLECTION_NAME = "questions";

    @Autowired
    private QuestionBankService questionBankService;

    public Question create(Question question) throws ExecutionException, InterruptedException {
        // Validate câu hỏi trước khi tạo
        validateQuestion(question);
        
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<DocumentReference> future = db.collection(COLLECTION_NAME).add(question);
        String id = future.get().getId();
        question.setId(id);
        db.collection(COLLECTION_NAME).document(id).set(question);
        try {
            updateStats(question.getQuestionBankId());
        } catch (Exception e) {
            // log lỗi nếu cần
        }
        return question;
    }

    /**
     * Validate câu hỏi trước khi lưu
     */
    private void validateQuestion(Question question) {
        if (question.getContent() == null || question.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung câu hỏi không được để trống");
        }
        
        if (question.getType() == null || question.getType().trim().isEmpty()) {
            throw new RuntimeException("Loại câu hỏi không được để trống");
        }
        
        if (question.getLevel() == null || question.getLevel().trim().isEmpty()) {
            throw new RuntimeException("Độ khó không được để trống");
        }
        
        // Validate theo loại câu hỏi
        switch (question.getType()) {
            case "true_false":
                validateTrueFalseQuestion(question);
                break;
            case "multiple_choice":
                validateMultipleChoiceQuestion(question);
                break;
            case "essay":
                validateEssayQuestion(question);
                break;
            default:
                throw new RuntimeException("Loại câu hỏi không hợp lệ: " + question.getType());
        }
    }

    /**
     * Validate câu hỏi đúng/sai
     */
    private void validateTrueFalseQuestion(Question question) {
        if (question.getAnswer() == null || question.getAnswer().trim().isEmpty()) {
            throw new RuntimeException("Đáp án câu hỏi đúng/sai không được để trống");
        }
        
        String answer = question.getAnswer().toLowerCase().trim();
        if (!answer.equals("true") && !answer.equals("false")) {
            throw new RuntimeException("Đáp án câu hỏi đúng/sai phải là 'true' hoặc 'false'");
        }
    }

    /**
     * Validate câu hỏi trắc nghiệm
     */
    private void validateMultipleChoiceQuestion(Question question) {
        if (question.getOptions() == null || question.getOptions().isEmpty()) {
            throw new RuntimeException("Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án");
        }
        
        if (question.getOptions().size() < 2) {
            throw new RuntimeException("Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án");
        }
        
        // Kiểm tra có ít nhất 1 đáp án đúng
        boolean hasCorrectAnswer = question.getOptions().stream()
            .anyMatch(Question.Option::isCorrect);
        
        if (!hasCorrectAnswer) {
            throw new RuntimeException("Câu hỏi trắc nghiệm phải có ít nhất 1 đáp án đúng");
        }
        
        // Kiểm tra nội dung đáp án không trống
        for (Question.Option option : question.getOptions()) {
            if (option.getText() == null || option.getText().trim().isEmpty()) {
                throw new RuntimeException("Nội dung đáp án không được để trống");
            }
        }
    }

    /**
     * Validate câu hỏi tự luận
     */
    private void validateEssayQuestion(Question question) {
        if (question.getAnswer() == null || question.getAnswer().trim().isEmpty()) {
            throw new RuntimeException("Đáp án mẫu câu hỏi tự luận không được để trống");
        }
    }

    /**
     * Tìm kiếm câu hỏi theo nhiều tiêu chí
     */
    public List<Question> searchQuestions(String questionBankId, String searchTerm, String type, String level) 
            throws ExecutionException, InterruptedException {
        List<Question> allQuestions = getAll(questionBankId);
        
        return allQuestions.stream()
            .filter(q -> {
                // Lọc theo từ khóa tìm kiếm
                if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                    if (!q.getContent().toLowerCase().contains(searchTerm.toLowerCase())) {
                        return false;
                    }
                }
                
                // Lọc theo loại câu hỏi
                if (type != null && !type.trim().isEmpty()) {
                    if (!q.getType().equals(type)) {
                        return false;
                    }
                }
                
                // Lọc theo độ khó
                if (level != null && !level.trim().isEmpty()) {
                    if (!q.getLevel().equals(level)) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy câu hỏi theo độ khó
     */
    public List<Question> getQuestionsByLevel(String questionBankId, String level) 
            throws ExecutionException, InterruptedException {
        return getAll(questionBankId).stream()
            .filter(q -> q.getLevel().equals(level))
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy câu hỏi theo loại
     */
    public List<Question> getQuestionsByType(String questionBankId, String type) 
            throws ExecutionException, InterruptedException {
        return getAll(questionBankId).stream()
            .filter(q -> q.getType().equals(type))
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Thống kê câu hỏi theo ngân hàng
     */
    public Map<String, Object> getQuestionStatistics(String questionBankId) 
            throws ExecutionException, InterruptedException {
        List<Question> questions = getAll(questionBankId);
        
        if (questions.isEmpty()) {
            return Map.of(
                "totalQuestions", 0,
                "byType", Map.of(),
                "byLevel", Map.of()
            );
        }
        
        // Thống kê theo loại
        Map<String, Long> byType = questions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Question::getType,
                java.util.stream.Collectors.counting()
            ));
        
        // Thống kê theo độ khó
        Map<String, Long> byLevel = questions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                Question::getLevel,
                java.util.stream.Collectors.counting()
            ));
        
        return Map.of(
            "totalQuestions", questions.size(),
            "byType", byType,
            "byLevel", byLevel
        );
    }

    public List<Question> getAll(String questionBankId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference ref = db.collection(COLLECTION_NAME);
        Query query = ref.whereEqualTo("questionBankId", questionBankId);
        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        List<Question> result = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            Question q = doc.toObject(Question.class);
            q.setId(doc.getId());
            result.add(q);
        }
        return result;
    }

    private void updateStats(String questionBankId) throws Exception {
        // Lấy tất cả câu hỏi thuộc bankId
        List<Question> questions = getAll(questionBankId);
        int total = questions.size();
        int easy = (int) questions.stream().filter(q -> "easy".equals(q.getLevel())).count();
        int medium = (int) questions.stream().filter(q -> "medium".equals(q.getLevel())).count();
        int hard = (int) questions.stream().filter(q -> "hard".equals(q.getLevel())).count();
        questionBankService.updateQuestionStats(questionBankId, total, easy, medium, hard);
    }

    public void delete(String id, String questionBankId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(id).delete();
        // Cập nhật lại số lượng câu hỏi cho ngân hàng đề
        try {
            updateStats(questionBankId);
        } catch (Exception e) {
            // log lỗi nếu cần
        }
    }
} 