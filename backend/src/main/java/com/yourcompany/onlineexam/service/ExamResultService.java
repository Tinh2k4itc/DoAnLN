package com.yourcompany.onlineexam.service;

import com.yourcompany.onlineexam.model.ExamResult;
import com.yourcompany.onlineexam.model.Part;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExamResultService {
    private final List<ExamResult> results = new ArrayList<>(); // demo: lưu tạm bộ nhớ

    @Autowired
    private PartService partService;

    public List<ExamResult> getAllResults() {
        return results;
    }

    public void saveResult(ExamResult result) {
        try {
            // Lấy đề thi để so sánh đáp án
            Part part = partService.getPartById(result.getTestName()); // testName là partId
            if (part != null && part.getQuestions() != null && result.getDetails() != null) {
                int correctCount = 0;
                for (int i = 0; i < part.getQuestions().size(); i++) {
                    Part.QuestionInTest q = part.getQuestions().get(i);
                    ExamResult.Detail d = result.getDetails().get(i);
                    boolean isCorrect = false;

                    // Lấy đáp án đúng dạng text
                    java.util.List<String> correctTexts = new java.util.ArrayList<>();
                    if (q.getOptions() != null) {
                        for (com.yourcompany.onlineexam.model.Question.Option opt : q.getOptions()) {
                            boolean isCorrectFlag = false;
                            try { isCorrectFlag = opt.isCorrect(); } catch (Exception ignore) {}
                            if (!isCorrectFlag) {
                                try {
                                    java.lang.reflect.Field f = opt.getClass().getDeclaredField("correct");
                                    f.setAccessible(true);
                                    Object val = f.get(opt);
                                    if (val instanceof Boolean && (Boolean)val) isCorrectFlag = true;
                                } catch (Exception ignore) {}
                            }
                            if (isCorrectFlag) correctTexts.add((opt.getText() != null ? opt.getText().trim().toLowerCase() : ""));
                        }
                    }

                    // Lấy đáp án người dùng dạng text
                    java.util.List<String> userTexts = new java.util.ArrayList<>();
                    if (d.getAnswer() != null && !d.getAnswer().trim().isEmpty()) {
                        String[] arr = d.getAnswer().split(",");
                        for (String s : arr) {
                            userTexts.add(s.trim().toLowerCase());
                        }
                    }

                    if (correctTexts.size() > 1) {
                        // Multiple choice: kiểm tra từng đáp án
                        boolean allCorrect = true;
                        if (userTexts.size() != correctTexts.size()) {
                            allCorrect = false;
                            System.out.println("[DEBUG] Sai số lượng đáp án: user=" + userTexts.size() + ", correct=" + correctTexts.size());
                        } else {
                            for (String ans : userTexts) {
                                if (!correctTexts.contains(ans)) {
                                    allCorrect = false;
                                    System.out.println("[DEBUG] Đáp án người dùng không đúng: " + ans);
                                } else {
                                    System.out.println("[DEBUG] Đáp án đúng: " + ans);
                                }
                            }
                            // Kiểm tra đáp án đúng có bị thiếu không
                            for (String ans : correctTexts) {
                                if (!userTexts.contains(ans)) {
                                    allCorrect = false;
                                    System.out.println("[DEBUG] Người dùng thiếu đáp án đúng: " + ans);
                                }
                            }
                        }
                        isCorrect = allCorrect;
                        System.out.println("[DEBUG] Kết quả multiple: " + isCorrect);
                    } else if (correctTexts.size() == 1) {
                        // Single/true-false: so sánh text
                        isCorrect = userTexts.size() == 1 && userTexts.get(0).equals(correctTexts.get(0));
                        System.out.println("[DEBUG] Kết quả single/true-false: " + isCorrect);
                    } else {
                        isCorrect = false;
                        System.out.println("[DEBUG] Không xác định được đáp án đúng!");
                    }
                    d.setCorrect(isCorrect);
                    d.setPoint(isCorrect ? 1 : 0);
                    if (isCorrect) correctCount++;
                }
                result.setScore(correctCount);
            }
            // Lưu vào Firestore
            Firestore db = FirestoreClient.getFirestore();
            ApiFuture<com.google.cloud.firestore.DocumentReference> future = db.collection("exam_results").add(result);
        } catch (Exception e) {
            // log lỗi nếu cần
        }
        results.add(result);
    }
} 