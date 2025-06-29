package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.Test;
import com.yourcompany.onlineexam.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private TestService testService;

    @GetMapping
    public ResponseEntity<List<Test>> getAllTests() {
        try {
            logger.info("Fetching all tests");
            List<Test> tests = testService.getAllTests();
            logger.info("Found {} tests", tests.size());
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            logger.error("Error fetching all tests", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable String id) {
        try {
            logger.info("Fetching test with id: {}", id);
            Test test = testService.getTestById(id);
            if (test != null) {
                logger.info("Test found: {}", test.getName());
                return ResponseEntity.ok(test);
            } else {
                logger.warn("Test not found with id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching test with id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<Test> createTest(@RequestBody Test test) {
        try {
            logger.info("Creating new test: {}", test.getName());
            Test createdTest = testService.createTest(test);
            logger.info("Test created successfully with id: {}", createdTest.getId());
            return ResponseEntity.ok(createdTest);
        } catch (Exception e) {
            logger.error("Error creating test", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Test> updateTest(@PathVariable String id, @RequestBody Test test) {
        try {
            logger.info("Updating test with id: {}", id);
            Test updatedTest = testService.updateTest(id, test);
            logger.info("Test updated successfully");
            return ResponseEntity.ok(updatedTest);
        } catch (Exception e) {
            logger.error("Error updating test with id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable String id) {
        try {
            logger.info("Deleting test with id: {}", id);
            testService.deleteTest(id);
            logger.info("Test deleted successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting test with id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Test> toggleTestStatus(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        try {
            boolean isActive = body.getOrDefault("isActive", false);
            logger.info("Toggling test status for id: {} to active: {}", id, isActive);
            Test test = testService.toggleTestStatus(id, isActive);
            logger.info("Test status updated successfully");
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            logger.error("Error toggling test status for id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Test>> getTestsByCourse(@PathVariable String courseId) {
        try {
            logger.info("Fetching tests for course: {}", courseId);
            List<Test> tests = testService.getTestsByCourse(courseId);
            logger.info("Found {} tests for course: {}", tests.size(), courseId);
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            logger.error("Error fetching tests for course: {}", courseId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Test>> getActiveTests() {
        try {
            logger.info("Fetching active tests");
            List<Test> tests = testService.getActiveTests();
            logger.info("Found {} active tests", tests.size());
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            logger.error("Error fetching active tests", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Test>> getAvailableTests() {
        try {
            logger.info("Fetching available tests for students");
            List<Test> tests = testService.getAvailableTests();
            logger.info("Found {} available tests", tests.size());
            return ResponseEntity.ok(tests);
        } catch (Exception e) {
            logger.error("Error fetching available tests", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/sample-data")
    public ResponseEntity<String> createSampleData() {
        try {
            logger.info("Creating sample data");
            testService.createSampleData();
            logger.info("Sample data created successfully");
            return ResponseEntity.ok("Sample data created successfully");
        } catch (Exception e) {
            logger.error("Error creating sample data", e);
            return ResponseEntity.status(500).body("Error creating sample data: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/student")
    public ResponseEntity<Test> getTestForStudent(@PathVariable String id) {
        try {
            logger.info("Fetching test for student with id: {}", id);
            Test test = testService.getTestById(id);
            if (test != null && Boolean.TRUE.equals(test.getIsActive())) {
                // Kiểm tra thời gian mở đề thi
                Date now = new Date();
                if (test.getStartDate() != null && now.before(test.getStartDate())) {
                    logger.warn("Test {} not yet available (start date: {})", id, test.getStartDate());
                    return ResponseEntity.status(403).build(); // Chưa đến thời gian mở
                }
                if (test.getEndDate() != null && now.after(test.getEndDate())) {
                    logger.warn("Test {} has ended (end date: {})", id, test.getEndDate());
                    return ResponseEntity.status(403).build(); // Đã hết thời gian
                }
                logger.info("Test {} is available for student", id);
                return ResponseEntity.ok(test);
            } else {
                logger.warn("Test {} not found or not active", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching test for student with id: {}", id, e);
            return ResponseEntity.status(500).build();
        }
    }
} 