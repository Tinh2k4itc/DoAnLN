package com.yourcompany.onlineexam.service;

import com.yourcompany.onlineexam.model.ExamResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExamResultService {
    private final List<ExamResult> results = new ArrayList<>(); // demo: lưu tạm bộ nhớ

    public List<ExamResult> getAllResults() {
        return results;
    }

    public void saveResult(ExamResult result) {
        results.add(result);
    }
} 