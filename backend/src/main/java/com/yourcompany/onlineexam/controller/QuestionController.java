package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.Question;
import com.yourcompany.onlineexam.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Question question) {
        try {
            Question created = questionService.create(question);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server!");
        }
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAll(@RequestParam String questionBankId) {
        try {
            return ResponseEntity.ok(questionService.getAll(questionBankId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam String id, @RequestParam String questionBankId) {
        try {
            questionService.delete(id, questionBankId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa câu hỏi!");
        }
    }
} 