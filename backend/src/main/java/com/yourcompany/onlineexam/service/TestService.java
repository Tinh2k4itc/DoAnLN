package com.yourcompany.onlineexam.service;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.yourcompany.onlineexam.model.Test;
import com.yourcompany.onlineexam.model.Question;
import com.yourcompany.onlineexam.model.QuestionBank;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.Random;

@Service
public class TestService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "tests";

    public TestService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Test> getAllTests() throws ExecutionException, InterruptedException {
        List<Test> tests = new ArrayList<>();
        CollectionReference testCollection = firestore.collection(COLLECTION_NAME);
        for (QueryDocumentSnapshot document : testCollection.get().get().getDocuments()) {
            Test test = document.toObject(Test.class);
            if (test != null) {
                test.setId(document.getId());
                tests.add(test);
            }
        }
        return tests;
    }

    public Test getTestById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot document = docRef.get().get();
        if (document.exists()) {
            Test test = document.toObject(Test.class);
            if (test != null) {
                test.setId(document.getId());
            }
            return test;
        }
        return null;
    }

    public Test createTest(Test test) throws ExecutionException, InterruptedException {
        // Validate trước khi tạo
        validateTest(test);
        
        DocumentReference documentReference = firestore.collection(COLLECTION_NAME).document();
        test.setId(documentReference.getId());
        test.setCreatedAt(new Date());
        test.setUpdatedAt(new Date());
        
        // Set default value for showAnswers if not provided
        if (test.getShowAnswers() == null) {
            test.setShowAnswers(false);
        }
        
        // Tạo câu hỏi cho bài thi từ ngân hàng câu hỏi
        if (test.getQuestionBankId() != null && test.getTotalQuestions() != null) {
            List<Test.TestQuestion> questions = generateTestQuestions(
                test.getQuestionBankId(), 
                test.getTotalQuestions(), 
                test.getDifficulty()
            );
            test.setQuestions(questions);
            
            // Tính lại tổng điểm dựa trên câu hỏi thực tế
            test.setTotalScore(calculateTotalScore(questions));
        }
        
        documentReference.set(test).get();
        return test;
    }

    public Test updateTest(String id, Test test) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        test.setId(id);
        test.setUpdatedAt(new Date());
        
        // Set default value for showAnswers if not provided
        if (test.getShowAnswers() == null) {
            test.setShowAnswers(false);
        }
        
        // Cập nhật câu hỏi nếu có thay đổi
        if (test.getQuestionBankId() != null && test.getTotalQuestions() != null) {
            List<Test.TestQuestion> questions = generateTestQuestions(
                test.getQuestionBankId(), 
                test.getTotalQuestions(), 
                test.getDifficulty()
            );
            test.setQuestions(questions);
        }
        
        docRef.set(test).get();
        return test;
    }

    public void deleteTest(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        docRef.delete().get();
    }

    public Test toggleTestStatus(String id, boolean isActive) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        docRef.update("isActive", isActive);
        docRef.update("updatedAt", new Date());
        return docRef.get().get().toObject(Test.class);
    }

    /**
     * Tạo danh sách câu hỏi cho bài thi từ ngân hàng câu hỏi với logic thông minh
     */
    private List<Test.TestQuestion> generateTestQuestions(String questionBankId, Integer totalQuestions, String difficulty) 
            throws ExecutionException, InterruptedException {
        
        // Lấy tất cả câu hỏi từ ngân hàng
        List<Question> allQuestions = getQuestionsFromBank(questionBankId);
        
        if (allQuestions.isEmpty()) {
            throw new RuntimeException("Ngân hàng câu hỏi không có câu hỏi nào");
        }

        // Lọc câu hỏi theo độ khó nếu không phải mixed
        List<Question> filteredQuestions = new ArrayList<>();
        if ("mixed".equals(difficulty)) {
            filteredQuestions = allQuestions;
        } else {
            for (Question q : allQuestions) {
                if (difficulty.equals(q.getLevel())) {
                    filteredQuestions.add(q);
                }
            }
        }
        
        if (filteredQuestions.isEmpty()) {
            throw new RuntimeException("Không có câu hỏi nào phù hợp với độ khó đã chọn");
        }

        // Logic phân bổ câu hỏi thông minh cho mixed difficulty
        List<Test.TestQuestion> selectedQuestions = new ArrayList<>();
        Random random = new Random();
        
        if ("mixed".equals(difficulty)) {
            // Phân bổ theo tỷ lệ: 40% easy, 40% medium, 20% hard
            int easyCount = (int) Math.round(totalQuestions * 0.4);
            int mediumCount = (int) Math.round(totalQuestions * 0.4);
            int hardCount = totalQuestions - easyCount - mediumCount;
            
            List<Question> easyQuestions = allQuestions.stream()
                .filter(q -> "easy".equals(q.getLevel()))
                .collect(java.util.stream.Collectors.toList());
            List<Question> mediumQuestions = allQuestions.stream()
                .filter(q -> "medium".equals(q.getLevel()))
                .collect(java.util.stream.Collectors.toList());
            List<Question> hardQuestions = allQuestions.stream()
                .filter(q -> "hard".equals(q.getLevel()))
                .collect(java.util.stream.Collectors.toList());
            
            // Chọn câu hỏi easy
            selectedQuestions.addAll(selectRandomQuestions(easyQuestions, easyCount, random));
            // Chọn câu hỏi medium
            selectedQuestions.addAll(selectRandomQuestions(mediumQuestions, mediumCount, random));
            // Chọn câu hỏi hard
            selectedQuestions.addAll(selectRandomQuestions(hardQuestions, hardCount, random));
            
        } else {
            // Chọn ngẫu nhiên từ câu hỏi đã lọc
            selectedQuestions.addAll(selectRandomQuestions(filteredQuestions, totalQuestions, random));
        }
        
        return selectedQuestions;
    }

    /**
     * Chọn ngẫu nhiên câu hỏi từ danh sách
     */
    private List<Test.TestQuestion> selectRandomQuestions(List<Question> questions, int count, Random random) {
        List<Test.TestQuestion> selected = new ArrayList<>();
        List<Question> availableQuestions = new ArrayList<>(questions);
        
        int questionsToSelect = Math.min(count, availableQuestions.size());
        
        for (int i = 0; i < questionsToSelect; i++) {
            int randomIndex = random.nextInt(availableQuestions.size());
            Question question = availableQuestions.get(randomIndex);
            
            Test.TestQuestion testQuestion = new Test.TestQuestion();
            testQuestion.setQuestionId(question.getId());
            testQuestion.setContent(question.getContent());
            testQuestion.setType(question.getType());
            testQuestion.setLevel(question.getLevel());
            
            // Phân bổ điểm theo độ khó
            testQuestion.setScore(calculateQuestionScore(question.getLevel()));
            testQuestion.setOptions(question.getOptions());
            
            selected.add(testQuestion);
            availableQuestions.remove(randomIndex); // Tránh trùng lặp
        }
        
        return selected;
    }

    /**
     * Tính điểm cho câu hỏi theo độ khó
     */
    private Integer calculateQuestionScore(String level) {
        switch (level) {
            case "easy": return 5;    // Câu dễ: 5 điểm
            case "medium": return 10; // Câu trung bình: 10 điểm
            case "hard": return 15;   // Câu khó: 15 điểm
            default: return 10;
        }
    }

    /**
     * Validate bài thi trước khi tạo
     */
    public void validateTest(Test test) throws ExecutionException, InterruptedException {
        if (test.getQuestionBankId() == null || test.getQuestionBankId().isEmpty()) {
            throw new RuntimeException("Phải chọn ngân hàng câu hỏi");
        }
        
        if (test.getTotalQuestions() == null || test.getTotalQuestions() <= 0) {
            throw new RuntimeException("Số câu hỏi phải lớn hơn 0");
        }
        
        if (test.getTimeLimit() == null || test.getTimeLimit() <= 0) {
            throw new RuntimeException("Thời gian làm bài phải lớn hơn 0");
        }
        
        // Kiểm tra số lượng câu hỏi có sẵn
        List<Question> availableQuestions = getQuestionsFromBank(test.getQuestionBankId());
        if (availableQuestions.isEmpty()) {
            throw new RuntimeException("Ngân hàng câu hỏi không có câu hỏi nào");
        }
        
        // Kiểm tra số câu hỏi theo độ khó
        if (!"mixed".equals(test.getDifficulty())) {
            long availableByDifficulty = availableQuestions.stream()
                .filter(q -> test.getDifficulty().equals(q.getLevel()))
                .count();
            if (availableByDifficulty < test.getTotalQuestions()) {
                throw new RuntimeException("Không đủ câu hỏi " + test.getDifficulty() + 
                    " (cần " + test.getTotalQuestions() + ", có " + availableByDifficulty + ")");
            }
        } else {
            if (availableQuestions.size() < test.getTotalQuestions()) {
                throw new RuntimeException("Không đủ câu hỏi trong ngân hàng " +
                    "(cần " + test.getTotalQuestions() + ", có " + availableQuestions.size() + ")");
            }
        }
        
        // Kiểm tra thời gian
        if (test.getStartDate() != null && test.getEndDate() != null) {
            if (test.getStartDate().after(test.getEndDate())) {
                throw new RuntimeException("Thời gian bắt đầu phải trước thời gian kết thúc");
            }
        }
    }

    /**
     * Cập nhật tổng điểm bài thi dựa trên câu hỏi
     */
    private Integer calculateTotalScore(List<Test.TestQuestion> questions) {
        return questions.stream()
            .mapToInt(Test.TestQuestion::getScore)
            .sum();
    }

    /**
     * Lấy tất cả câu hỏi từ một ngân hàng câu hỏi
     */
    private List<Question> getQuestionsFromBank(String questionBankId) throws ExecutionException, InterruptedException {
        List<Question> questions = new ArrayList<>();
        CollectionReference questionCollection = firestore.collection("questions");
        
        for (QueryDocumentSnapshot document : questionCollection.get().get().getDocuments()) {
            Question question = document.toObject(Question.class);
            if (question != null && questionBankId.equals(question.getQuestionBankId())) {
                question.setId(document.getId());
                questions.add(question);
            }
        }
        
        return questions;
    }

    /**
     * Lấy danh sách bài thi theo môn học
     */
    public List<Test> getTestsByCourse(String courseId) throws ExecutionException, InterruptedException {
        List<Test> tests = new ArrayList<>();
        CollectionReference testCollection = firestore.collection(COLLECTION_NAME);
        
        for (QueryDocumentSnapshot document : testCollection.get().get().getDocuments()) {
            Test test = document.toObject(Test.class);
            if (test != null && courseId.equals(test.getCourseId())) {
                test.setId(document.getId());
                tests.add(test);
            }
        }
        
        return tests;
    }

    /**
     * Lấy danh sách bài thi đang hoạt động
     */
    public List<Test> getActiveTests() throws ExecutionException, InterruptedException {
        List<Test> tests = new ArrayList<>();
        CollectionReference testCollection = firestore.collection(COLLECTION_NAME);
        
        for (QueryDocumentSnapshot document : testCollection.get().get().getDocuments()) {
            Test test = document.toObject(Test.class);
            if (test != null && Boolean.TRUE.equals(test.getIsActive())) {
                test.setId(document.getId());
                tests.add(test);
            }
        }
        
        return tests;
    }

    /**
     * Lấy danh sách bài thi khả dụng cho học sinh (đang hoạt động và trong thời gian cho phép)
     */
    public List<Test> getAvailableTests() throws ExecutionException, InterruptedException {
        List<Test> tests = new ArrayList<>();
        CollectionReference testCollection = firestore.collection(COLLECTION_NAME);
        Date now = new Date();
        
        for (QueryDocumentSnapshot document : testCollection.get().get().getDocuments()) {
            Test test = document.toObject(Test.class);
            if (test != null && Boolean.TRUE.equals(test.getIsActive())) {
                // Kiểm tra thời gian
                boolean isAvailable = true;
                
                if (test.getStartDate() != null && now.before(test.getStartDate())) {
                    isAvailable = false; // Chưa đến thời gian mở
                }
                
                if (test.getEndDate() != null && now.after(test.getEndDate())) {
                    isAvailable = false; // Đã hết thời gian
                }
                
                if (isAvailable) {
                    test.setId(document.getId());
                    tests.add(test);
                }
            }
        }
        
        return tests;
    }

    /**
     * Tạo dữ liệu mẫu cho testing (chỉ sử dụng trong development)
     */
    public void createSampleData() throws ExecutionException, InterruptedException {
        // Kiểm tra xem đã có dữ liệu chưa
        List<Test> existingTests = getAllTests();
        if (!existingTests.isEmpty()) {
            System.out.println("Sample data already exists. Skipping creation.");
            return;
        }

        System.out.println("Creating sample test data...");
        
        // Tạo bài thi mẫu 1
        Test test1 = new Test();
        test1.setName("Bài thi mẫu - Lập trình Java");
        test1.setDescription("Bài thi kiểm tra kiến thức cơ bản về Java");
        test1.setCourseId("java101");
        test1.setCourseName("Lập trình Java cơ bản");
        test1.setPartId("part1");
        test1.setPartName("Chương 1: Giới thiệu Java");
        test1.setQuestionBankId("java_basic");
        test1.setQuestionBankName("Ngân hàng câu hỏi Java cơ bản");
        test1.setTotalQuestions(10);
        test1.setTimeLimit(30);
        test1.setTotalScore(100);
        test1.setDifficulty("mixed");
        test1.setIsActive(true);
        test1.setShowAnswers(true);
        
        // Thời gian mở từ hôm nay đến 30 ngày sau
        Date now = new Date();
        test1.setStartDate(now);
        test1.setEndDate(new Date(now.getTime() + 30L * 24 * 60 * 60 * 1000));
        
        createTest(test1);
        System.out.println("Created sample test 1");

        // Tạo bài thi mẫu 2
        Test test2 = new Test();
        test2.setName("Bài thi mẫu - Cơ sở dữ liệu");
        test2.setDescription("Bài thi kiểm tra kiến thức về SQL và database");
        test2.setCourseId("db101");
        test2.setCourseName("Cơ sở dữ liệu");
        test2.setPartId("part1");
        test2.setPartName("Chương 1: Giới thiệu SQL");
        test2.setQuestionBankId("sql_basic");
        test2.setQuestionBankName("Ngân hàng câu hỏi SQL cơ bản");
        test2.setTotalQuestions(15);
        test2.setTimeLimit(45);
        test2.setTotalScore(150);
        test2.setDifficulty("medium");
        test2.setIsActive(true);
        test2.setShowAnswers(false);
        
        // Thời gian mở từ hôm nay đến 15 ngày sau
        test2.setStartDate(now);
        test2.setEndDate(new Date(now.getTime() + 15L * 24 * 60 * 60 * 1000));
        
        createTest(test2);
        System.out.println("Created sample test 2");

        // Tạo bài thi mẫu 3 (chưa mở)
        Test test3 = new Test();
        test3.setName("Bài thi mẫu - Web Development");
        test3.setDescription("Bài thi kiểm tra kiến thức về HTML, CSS, JavaScript");
        test3.setCourseId("web101");
        test3.setCourseName("Phát triển Web");
        test3.setPartId("part1");
        test3.setPartName("Chương 1: HTML cơ bản");
        test3.setQuestionBankId("html_basic");
        test3.setQuestionBankName("Ngân hàng câu hỏi HTML cơ bản");
        test3.setTotalQuestions(20);
        test3.setTimeLimit(60);
        test3.setTotalScore(200);
        test3.setDifficulty("easy");
        test3.setIsActive(true);
        test3.setShowAnswers(true);
        
        // Thời gian mở từ 7 ngày sau đến 30 ngày sau
        test3.setStartDate(new Date(now.getTime() + 7L * 24 * 60 * 60 * 1000));
        test3.setEndDate(new Date(now.getTime() + 30L * 24 * 60 * 60 * 1000));
        
        createTest(test3);
        System.out.println("Created sample test 3");

        System.out.println("Sample data creation completed!");
    }
}