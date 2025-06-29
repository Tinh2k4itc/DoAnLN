package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.TestResult;
import com.yourcompany.onlineexam.service.TestResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "http://localhost:5173")
public class TestResultController {

    @Autowired
    private TestResultService testResultService;

    /**
     * Bắt đầu làm bài thi
     */
    @PostMapping("/start")
    public ResponseEntity<TestResult> startTest(@RequestBody Map<String, String> request) {
        try {
            String testId = request.get("testId");
            String userId = request.get("userId");
            String userName = request.get("userName");
            String userEmail = request.get("userEmail");

            TestResult result = testResultService.startTest(testId, userId, userName, userEmail);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Nộp bài thi
     */
    @PostMapping("/{resultId}/submit")
    public ResponseEntity<TestResult> submitTest(
            @PathVariable String resultId,
            @RequestBody List<TestResult.AnswerDetail> answers) {
        try {
            TestResult result = testResultService.submitTest(resultId, answers);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy kết quả thi theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestResult> getTestResultById(@PathVariable String id) {
        try {
            TestResult result = testResultService.getTestResultById(id);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Lấy kết quả thi của user cho một bài thi cụ thể
     */
    @GetMapping("/user/{userId}/test/{testId}")
    public ResponseEntity<TestResult> getTestResultByUserAndTest(
            @PathVariable String userId,
            @PathVariable String testId) {
        try {
            TestResult result = testResultService.getTestResultByUserAndTest(userId, testId);
            if (result != null) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Lấy tất cả kết quả thi của một user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TestResult>> getTestResultsByUser(@PathVariable String userId) {
        try {
            List<TestResult> results = testResultService.getTestResultsByUser(userId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Lấy tất cả kết quả thi của một bài thi (cho admin)
     */
    @GetMapping("/test/{testId}")
    public ResponseEntity<List<TestResult>> getTestResultsByTest(@PathVariable String testId) {
        try {
            List<TestResult> results = testResultService.getTestResultsByTest(testId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Lấy thống kê kết quả thi
     */
    @GetMapping("/test/{testId}/statistics")
    public ResponseEntity<Map<String, Object>> getTestStatistics(@PathVariable String testId) {
        try {
            Map<String, Object> statistics = testResultService.getTestStatistics(testId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
} 