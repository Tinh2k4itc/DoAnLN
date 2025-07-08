package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.ExamResult;
import com.yourcompany.onlineexam.service.ExamResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exam-results")
public class ExamResultController {
    @Autowired
    private ExamResultService examResultService;

    @GetMapping
    public List<ExamResult> getAllResults() {
        return examResultService.getAllResults();
    }

    @PostMapping
    public void saveResult(@RequestBody ExamResult result) {
        examResultService.saveResult(result);
    }
} 