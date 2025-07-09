package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.ExamResult;
import com.yourcompany.onlineexam.service.ExamResultService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-results")
@CrossOrigin(origins = "http://localhost:5173")
public class ExamResultController {
    @Autowired
    private ExamResultService examResultService;
    private static final Logger logger = LoggerFactory.getLogger(ExamResultController.class);

    @GetMapping
    public ResponseEntity<List<ExamResult>> getAllResults() {
        try {
            List<ExamResult> results = examResultService.getAllResults();
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách exam results: ", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody ExamResult result) {
        try {
            examResultService.saveResult(result);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Lỗi khi lưu exam result: ", e);
            return ResponseEntity.status(500).body("Lỗi khi lưu kết quả thi!");
        }
    }
} 