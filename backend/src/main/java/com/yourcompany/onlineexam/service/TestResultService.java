package com.yourcompany.onlineexam.service;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.yourcompany.onlineexam.model.TestResult;
import com.yourcompany.onlineexam.model.Test;
import com.yourcompany.onlineexam.model.Question;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class TestResultService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "testResults";

    public TestResultService(Firestore firestore) {
        this.firestore = firestore;
    }

    /**
     * Bắt đầu làm bài thi - tạo session mới
     */
    public TestResult startTest(String testId, String userId, String userName, String userEmail) 
            throws ExecutionException, InterruptedException {
        
        // Lấy thông tin bài thi
        Test test = getTestById(testId);
        if (test == null || !test.getIsActive()) {
            throw new RuntimeException("Bài thi không tồn tại hoặc đã bị khóa");
        }

        // Kiểm tra thời gian thi
        Date now = new Date();
        if (test.getStartDate() != null && now.before(test.getStartDate())) {
            throw new RuntimeException("Bài thi chưa bắt đầu");
        }
        if (test.getEndDate() != null && now.after(test.getEndDate())) {
            throw new RuntimeException("Bài thi đã kết thúc");
        }

        // Kiểm tra xem user đã làm bài này chưa
        TestResult existingResult = getTestResultByUserAndTest(userId, testId);
        if (existingResult != null && existingResult.getIsCompleted()) {
            throw new RuntimeException("Bạn đã hoàn thành bài thi này");
        }

        // Tạo kết quả thi mới
        TestResult result = new TestResult();
        result.setTestId(testId);
        result.setTestName(test.getName());
        result.setUserId(userId);
        result.setUserName(userName);
        result.setUserEmail(userEmail);
        result.setCourseId(test.getCourseId());
        result.setCourseName(test.getCourseName());
        result.setTotalQuestions(test.getTotalQuestions());
        result.setTotalScore(test.getTotalScore());
        result.setStartTime(now);
        result.setIsCompleted(false);
        result.setIsPassed(false);
        result.setCreatedAt(now);
        result.setUpdatedAt(now);

        // Lưu vào database
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document();
        result.setId(docRef.getId());
        docRef.set(result).get();

        return result;
    }

    /**
     * Nộp bài thi và tính điểm
     */
    public TestResult submitTest(String resultId, List<TestResult.AnswerDetail> answers) 
            throws ExecutionException, InterruptedException {
        
        TestResult result = getTestResultById(resultId);
        if (result == null) {
            throw new RuntimeException("Không tìm thấy kết quả thi");
        }

        if (result.getIsCompleted()) {
            throw new RuntimeException("Bài thi đã được nộp");
        }

        // Tính điểm
        Test test = getTestById(result.getTestId());
        Map<String, Question> questionMap = getQuestionsMap(test.getQuestions());
        
        int correctAnswers = 0;
        int earnedScore = 0;
        List<TestResult.AnswerDetail> processedAnswers = new ArrayList<>();

        for (TestResult.AnswerDetail answer : answers) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question != null) {
                answer.setQuestionContent(question.getContent());
                answer.setQuestionType(question.getType());
                answer.setQuestionScore(10); // Mặc định 10 điểm/câu

                // Kiểm tra đáp án
                boolean isCorrect = checkAnswer(question, answer);
                answer.setIsCorrect(isCorrect);
                
                if (isCorrect) {
                    correctAnswers++;
                    earnedScore += answer.getQuestionScore();
                }
                answer.setEarnedScore(isCorrect ? answer.getQuestionScore() : 0);
                
                processedAnswers.add(answer);
            }
        }

        // Cập nhật kết quả
        Date endTime = new Date();
        long timeSpentMillis = endTime.getTime() - result.getStartTime().getTime();
        int timeSpentMinutes = (int) (timeSpentMillis / (1000 * 60));

        result.setCorrectAnswers(correctAnswers);
        result.setEarnedScore(earnedScore);
        result.setPercentage((double) earnedScore / result.getTotalScore() * 100);
        result.setGrade(calculateGrade(result.getPercentage()));
        result.setEndTime(endTime);
        result.setTimeSpent(timeSpentMinutes);
        result.setIsCompleted(true);
        result.setIsPassed(result.getPercentage() >= 50.0); // Điểm đạt >= 50%
        result.setAnswers(processedAnswers);
        result.setUpdatedAt(endTime);

        // Lưu kết quả
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(resultId);
        docRef.set(result).get();

        return result;
    }

    /**
     * Kiểm tra đáp án đúng
     */
    private boolean checkAnswer(Question question, TestResult.AnswerDetail answer) {
        switch (question.getType()) {
            case "true_false":
                return question.getAnswer().equalsIgnoreCase(answer.getUserAnswer());
            
            case "multiple_choice":
                if (question.getOptions() == null) return false;
                // Tìm đáp án đúng
                List<String> correctOptions = new ArrayList<>();
                for (Question.Option option : question.getOptions()) {
                    if (option.isCorrect()) {
                        correctOptions.add(option.getText());
                    }
                }
                answer.setCorrectOptions(correctOptions);
                return correctOptions.contains(answer.getUserAnswer());
            
            case "essay":
                // Với câu hỏi tự luận, cần chấm thủ công
                return false; // Mặc định false, cần admin chấm
            
            default:
                return false;
        }
    }

    /**
     * Tính điểm chữ dựa trên phần trăm
     */
    private String calculateGrade(Double percentage) {
        if (percentage >= 90.0) return "A";
        if (percentage >= 80.0) return "B";
        if (percentage >= 70.0) return "C";
        if (percentage >= 60.0) return "D";
        return "F";
    }

    /**
     * Lấy kết quả thi theo ID
     */
    public TestResult getTestResultById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot document = docRef.get().get();
        if (document.exists()) {
            return document.toObject(TestResult.class);
        }
        return null;
    }

    /**
     * Lấy kết quả thi của user cho một bài thi cụ thể
     */
    public TestResult getTestResultByUserAndTest(String userId, String testId) 
            throws ExecutionException, InterruptedException {
        CollectionReference collection = firestore.collection(COLLECTION_NAME);
        for (QueryDocumentSnapshot document : collection.get().get().getDocuments()) {
            TestResult result = document.toObject(TestResult.class);
            if (result != null && userId.equals(result.getUserId()) && testId.equals(result.getTestId())) {
                result.setId(document.getId());
                return result;
            }
        }
        return null;
    }

    /**
     * Lấy tất cả kết quả thi của một user
     */
    public List<TestResult> getTestResultsByUser(String userId) throws ExecutionException, InterruptedException {
        List<TestResult> results = new ArrayList<>();
        CollectionReference collection = firestore.collection(COLLECTION_NAME);
        for (QueryDocumentSnapshot document : collection.get().get().getDocuments()) {
            TestResult result = document.toObject(TestResult.class);
            if (result != null && userId.equals(result.getUserId())) {
                result.setId(document.getId());
                results.add(result);
            }
        }
        return results;
    }

    /**
     * Lấy tất cả kết quả thi của một bài thi
     */
    public List<TestResult> getTestResultsByTest(String testId) throws ExecutionException, InterruptedException {
        List<TestResult> results = new ArrayList<>();
        CollectionReference collection = firestore.collection(COLLECTION_NAME);
        for (QueryDocumentSnapshot document : collection.get().get().getDocuments()) {
            TestResult result = document.toObject(TestResult.class);
            if (result != null && testId.equals(result.getTestId())) {
                result.setId(document.getId());
                results.add(result);
            }
        }
        return results;
    }

    /**
     * Lấy thống kê kết quả thi
     */
    public Map<String, Object> getTestStatistics(String testId) throws ExecutionException, InterruptedException {
        List<TestResult> results = getTestResultsByTest(testId);
        
        if (results.isEmpty()) {
            return Map.of(
                "totalParticipants", 0,
                "averageScore", 0.0,
                "passRate", 0.0,
                "gradeDistribution", Map.of()
            );
        }

        int totalParticipants = results.size();
        int passedCount = (int) results.stream().filter(TestResult::getIsPassed).count();
        double averageScore = results.stream()
                .mapToDouble(TestResult::getPercentage)
                .average()
                .orElse(0.0);
        double passRate = (double) passedCount / totalParticipants * 100;

        // Phân bố điểm
        Map<String, Long> gradeDistribution = results.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    TestResult::getGrade,
                    java.util.stream.Collectors.counting()
                ));

        return Map.of(
            "totalParticipants", totalParticipants,
            "averageScore", Math.round(averageScore * 100.0) / 100.0,
            "passRate", Math.round(passRate * 100.0) / 100.0,
            "gradeDistribution", gradeDistribution
        );
    }

    // Helper methods
    private Test getTestById(String testId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("tests").document(testId);
        DocumentSnapshot document = docRef.get().get();
        if (document.exists()) {
            return document.toObject(Test.class);
        }
        return null;
    }

    private Map<String, Question> getQuestionsMap(List<Test.TestQuestion> testQuestions) 
            throws ExecutionException, InterruptedException {
        Map<String, Question> questionMap = new HashMap<>();
        CollectionReference questionCollection = firestore.collection("questions");
        
        for (QueryDocumentSnapshot document : questionCollection.get().get().getDocuments()) {
            Question question = document.toObject(Question.class);
            if (question != null) {
                question.setId(document.getId());
                questionMap.put(question.getId(), question);
            }
        }
        
        return questionMap;
    }
} 