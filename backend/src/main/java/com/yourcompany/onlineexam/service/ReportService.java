package com.yourcompany.onlineexam.service;

import com.yourcompany.onlineexam.model.TestResult;
import com.yourcompany.onlineexam.model.Test;
import com.yourcompany.onlineexam.model.Course;
import com.yourcompany.onlineexam.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TestResultService testResultService;
    
    @Autowired
    private TestService testService;
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private UserService userService;

    /**
     * Báo cáo tổng quan hệ thống với thống kê chi tiết
     */
    public Map<String, Object> getSystemOverview() throws ExecutionException, InterruptedException {
        List<Test> allTests = testService.getAllTests();
        List<Course> allCourses = courseService.getAllCourses();
        List<User> allUsers = userService.getAll();
        
        // Thống kê bài thi
        long activeTests = allTests.stream().filter(Test::getIsActive).count();
        long completedTests = allTests.stream().filter(test -> !test.getIsActive()).count();
        
        // Thống kê theo môn học
        Map<String, Long> testsByCourse = allTests.stream()
            .collect(Collectors.groupingBy(Test::getCourseName, Collectors.counting()));
        
        // Thống kê theo độ khó
        Map<String, Long> testsByDifficulty = allTests.stream()
            .collect(Collectors.groupingBy(Test::getDifficulty, Collectors.counting()));
        
        // Thống kê user theo role
        Map<String, Long> usersByRole = allUsers.stream()
            .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
            .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
        
        // Tính tổng số bài thi đã làm
        long totalTestAttempts = 0;
        double overallAverageScore = 0.0;
        try {
            List<TestResult> allResults = getAllTestResults();
            totalTestAttempts = allResults.size();
            if (!allResults.isEmpty()) {
                overallAverageScore = allResults.stream()
                    .mapToDouble(TestResult::getPercentage)
                    .average()
                    .orElse(0.0);
            }
        } catch (Exception e) {
            // Log error if needed
        }
        
        return Map.of(
            "totalTests", allTests.size(),
            "activeTests", activeTests,
            "completedTests", completedTests,
            "totalCourses", allCourses.size(),
            "totalUsers", allUsers.stream().filter(user -> !Boolean.TRUE.equals(user.getIsDeleted())).count(),
            "totalTestAttempts", totalTestAttempts,
            "overallAverageScore", Math.round(overallAverageScore * 100.0) / 100.0,
            "testsByCourse", testsByCourse,
            "testsByDifficulty", testsByDifficulty,
            "usersByRole", usersByRole
        );
    }

    /**
     * Báo cáo chi tiết một môn học với phân tích sâu
     */
    public Map<String, Object> getCourseReport(String courseId) throws ExecutionException, InterruptedException {
        List<Test> courseTests = testService.getTestsByCourse(courseId);
        
        if (courseTests.isEmpty()) {
            return Map.of(
                "error", "Không tìm thấy bài thi nào cho môn học này",
                "totalTests", 0
            );
        }
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalTests", courseTests.size());
        report.put("activeTests", courseTests.stream().filter(Test::getIsActive).count());
        
        // Thống kê kết quả thi
        List<TestResult> allResults = new ArrayList<>();
        for (Test test : courseTests) {
            try {
                allResults.addAll(testResultService.getTestResultsByTest(test.getId()));
            } catch (Exception e) {
                // Continue with other tests if one fails
            }
        }
        
        if (!allResults.isEmpty()) {
            // Thống kê cơ bản
            double averageScore = allResults.stream()
                .mapToDouble(TestResult::getPercentage)
                .average()
                .orElse(0.0);
            
            long totalParticipants = allResults.size();
            long passedCount = allResults.stream().filter(TestResult::getIsPassed).count();
            double passRate = (double) passedCount / totalParticipants * 100;
            
            // Phân bố điểm
            Map<String, Long> gradeDistribution = allResults.stream()
                .collect(Collectors.groupingBy(TestResult::getGrade, Collectors.counting()));
            
            // Thống kê theo bài thi
            Map<String, Object> testStatistics = new HashMap<>();
            for (Test test : courseTests) {
                List<TestResult> testResults = allResults.stream()
                    .filter(result -> result.getTestId().equals(test.getId()))
                    .collect(Collectors.toList());
                
                if (!testResults.isEmpty()) {
                    double testAvg = testResults.stream()
                        .mapToDouble(TestResult::getPercentage)
                        .average()
                        .orElse(0.0);
                    
                    testStatistics.put(test.getName(), Map.of(
                        "participants", testResults.size(),
                        "averageScore", Math.round(testAvg * 100.0) / 100.0,
                        "passRate", Math.round((double) testResults.stream().filter(TestResult::getIsPassed).count() / testResults.size() * 100 * 100.0) / 100.0
                    ));
                }
            }
            
            // Phân tích thời gian làm bài
            double averageTimeSpent = allResults.stream()
                .mapToDouble(TestResult::getTimeSpent)
                .average()
                .orElse(0.0);
            
            report.put("totalParticipants", totalParticipants);
            report.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
            report.put("passRate", Math.round(passRate * 100.0) / 100.0);
            report.put("gradeDistribution", gradeDistribution);
            report.put("testStatistics", testStatistics);
            report.put("averageTimeSpent", Math.round(averageTimeSpent * 100.0) / 100.0);
        } else {
            report.put("totalParticipants", 0);
            report.put("averageScore", 0.0);
            report.put("passRate", 0.0);
            report.put("gradeDistribution", Map.of());
            report.put("testStatistics", Map.of());
            report.put("averageTimeSpent", 0.0);
        }
        
        return report;
    }

    /**
     * Báo cáo hiệu suất học tập của user với phân tích chi tiết
     */
    public Map<String, Object> getUserPerformanceReport(String userId) throws ExecutionException, InterruptedException {
        List<TestResult> userResults = testResultService.getTestResultsByUser(userId);
        
        if (userResults.isEmpty()) {
            return Map.of(
                "totalTestsTaken", 0,
                "averageScore", 0.0,
                "bestScore", 0.0,
                "worstScore", 0.0,
                "passRate", 0.0,
                "improvementTrend", "N/A",
                "performanceByCourse", Map.of(),
                "recentPerformance", List.of(),
                "strengths", List.of(),
                "weaknesses", List.of()
            );
        }
        
        // Tính toán các chỉ số cơ bản
        double averageScore = userResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .average()
            .orElse(0.0);
        
        double bestScore = userResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .max()
            .orElse(0.0);
        
        double worstScore = userResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .min()
            .orElse(0.0);
        
        long passedTests = userResults.stream().filter(TestResult::getIsPassed).count();
        double passRate = (double) passedTests / userResults.size() * 100;
        
        // Xu hướng cải thiện
        String improvementTrend = calculateImprovementTrend(userResults);
        
        // Phân tích theo môn học
        Map<String, Object> performanceByCourse = new HashMap<>();
        Map<String, List<TestResult>> resultsByCourse = userResults.stream()
            .collect(Collectors.groupingBy(TestResult::getCourseName));
        
        for (Map.Entry<String, List<TestResult>> entry : resultsByCourse.entrySet()) {
            List<TestResult> courseResults = entry.getValue();
            double courseAvg = courseResults.stream()
                .mapToDouble(TestResult::getPercentage)
                .average()
                .orElse(0.0);
            
            long coursePassed = courseResults.stream().filter(TestResult::getIsPassed).count();
            double coursePassRate = (double) coursePassed / courseResults.size() * 100;
            
            performanceByCourse.put(entry.getKey(), Map.of(
                "averageScore", Math.round(courseAvg * 100.0) / 100.0,
                "passRate", Math.round(coursePassRate * 100.0) / 100.0,
                "testsTaken", courseResults.size()
            ));
        }
        
        // Hiệu suất gần đây (5 bài thi cuối)
        List<Map<String, Object>> recentPerformance = (List<Map<String, Object>>) (List<?>) userResults.stream()
            .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
            .limit(5)
            .map(result -> Map.of(
                "testName", result.getTestName(),
                "score", result.getPercentage(),
                "grade", result.getGrade(),
                "date", result.getCreatedAt()
            ))
            .collect(Collectors.toList());
        
        // Phân tích điểm mạnh và điểm yếu
        List<String> strengths = analyzeStrengths(userResults);
        List<String> weaknesses = analyzeWeaknesses(userResults);
        
        return Map.of(
            "totalTestsTaken", userResults.size(),
            "averageScore", Math.round(averageScore * 100.0) / 100.0,
            "bestScore", Math.round(bestScore * 100.0) / 100.0,
            "worstScore", Math.round(worstScore * 100.0) / 100.0,
            "passRate", Math.round(passRate * 100.0) / 100.0,
            "improvementTrend", improvementTrend,
            "performanceByCourse", performanceByCourse,
            "recentPerformance", recentPerformance,
            "strengths", strengths,
            "weaknesses", weaknesses
        );
    }

    /**
     * Báo cáo so sánh hiệu suất giữa các user với phân tích nâng cao
     */
    public Map<String, Object> getComparativeReport(String testId) throws ExecutionException, InterruptedException {
        List<TestResult> testResults = testResultService.getTestResultsByTest(testId);
        
        if (testResults.isEmpty()) {
            return Map.of("message", "Chưa có kết quả thi");
        }
        
        // Thống kê cơ bản
        double averageScore = testResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .average()
            .orElse(0.0);
        
        double medianScore = calculateMedian(testResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .toArray());
        
        double standardDeviation = calculateStandardDeviation(testResults.stream()
            .mapToDouble(TestResult::getPercentage)
            .toArray());
        
        // Top performers
        List<Map<String, Object>> topPerformers = (List<Map<String, Object>>) (List<?>) testResults.stream()
            .sorted((r1, r2) -> Double.compare(r2.getPercentage(), r1.getPercentage()))
            .limit(5)
            .map(result -> Map.of(
                "userName", result.getUserName(),
                "score", result.getPercentage(),
                "grade", result.getGrade(),
                "timeSpent", result.getTimeSpent(),
                "correctAnswers", result.getCorrectAnswers(),
                "totalQuestions", result.getTotalQuestions()
            ))
            .collect(Collectors.toList());
        
        // Bottom performers (để phân tích)
        List<Map<String, Object>> bottomPerformers = (List<Map<String, Object>>) (List<?>) testResults.stream()
            .sorted((r1, r2) -> Double.compare(r1.getPercentage(), r2.getPercentage()))
            .limit(3)
            .map(result -> Map.of(
                "userName", result.getUserName(),
                "score", result.getPercentage(),
                "grade", result.getGrade(),
                "timeSpent", result.getTimeSpent()
            ))
            .collect(Collectors.toList());
        
        // Phân tích thời gian làm bài
        double averageTimeSpent = testResults.stream()
            .mapToDouble(TestResult::getTimeSpent)
            .average()
            .orElse(0.0);
        
        // Phân tích phân bố điểm
        Map<String, Long> scoreDistribution = testResults.stream()
            .collect(Collectors.groupingBy(
                result -> {
                    double score = result.getPercentage();
                    if (score >= 90) return "90-100";
                    if (score >= 80) return "80-89";
                    if (score >= 70) return "70-79";
                    if (score >= 60) return "60-69";
                    return "0-59";
                },
                Collectors.counting()
            ));
        
        return Map.of(
            "totalParticipants", testResults.size(),
            "averageScore", Math.round(averageScore * 100.0) / 100.0,
            "medianScore", Math.round(medianScore * 100.0) / 100.0,
            "standardDeviation", Math.round(standardDeviation * 100.0) / 100.0,
            "topPerformers", topPerformers,
            "bottomPerformers", bottomPerformers,
            "averageTimeSpent", Math.round(averageTimeSpent * 100.0) / 100.0,
            "scoreDistribution", scoreDistribution
        );
    }

    /**
     * Báo cáo xu hướng theo thời gian
     */
    public Map<String, Object> getTrendReport(String courseId, int months) throws ExecutionException, InterruptedException {
        List<Test> courseTests = testService.getTestsByCourse(courseId);
        List<TestResult> allResults = new ArrayList<>();
        
        for (Test test : courseTests) {
            try {
                allResults.addAll(testResultService.getTestResultsByTest(test.getId()));
            } catch (Exception e) {
                // Continue with other tests
            }
        }
        
        if (allResults.isEmpty()) {
            return Map.of("message", "Không có dữ liệu để phân tích xu hướng");
        }
        
        // Nhóm kết quả theo tháng
        Map<String, List<TestResult>> resultsByMonth = allResults.stream()
            .collect(Collectors.groupingBy(result -> {
                Calendar cal = Calendar.getInstance();
                cal.setTime(result.getCreatedAt());
                return cal.get(Calendar.YEAR) + "-" + String.format("%02d", cal.get(Calendar.MONTH) + 1);
            }));
        
        // Tính trung bình điểm theo tháng
        Map<String, Double> averageByMonth = new HashMap<>();
        for (Map.Entry<String, List<TestResult>> entry : resultsByMonth.entrySet()) {
            double avg = entry.getValue().stream()
                .mapToDouble(TestResult::getPercentage)
                .average()
                .orElse(0.0);
            averageByMonth.put(entry.getKey(), Math.round(avg * 100.0) / 100.0);
        }
        
        return Map.of(
            "trendData", averageByMonth,
            "totalMonths", averageByMonth.size(),
            "overallTrend", calculateOverallTrend(averageByMonth)
        );
    }

    /**
     * Phân tích điểm mạnh của user
     */
    private List<String> analyzeStrengths(List<TestResult> results) {
        List<String> strengths = new ArrayList<>();
        
        // Phân tích theo môn học
        Map<String, Double> courseAverages = results.stream()
            .collect(Collectors.groupingBy(
                TestResult::getCourseName,
                Collectors.averagingDouble(TestResult::getPercentage)
            ));
        
        courseAverages.entrySet().stream()
            .filter(entry -> entry.getValue() >= 80.0)
            .forEach(entry -> strengths.add("Xuất sắc trong môn " + entry.getKey()));
        
        // Phân tích điểm cao
        long highScores = results.stream()
            .filter(result -> result.getPercentage() >= 90.0)
            .count();
        
        if (highScores > 0) {
            strengths.add("Có " + highScores + " bài thi đạt điểm xuất sắc (≥90%)");
        }
        
        return strengths;
    }

    /**
     * Phân tích điểm yếu của user
     */
    private List<String> analyzeWeaknesses(List<TestResult> results) {
        List<String> weaknesses = new ArrayList<>();
        
        // Phân tích theo môn học
        Map<String, Double> courseAverages = results.stream()
            .collect(Collectors.groupingBy(
                TestResult::getCourseName,
                Collectors.averagingDouble(TestResult::getPercentage)
            ));
        
        courseAverages.entrySet().stream()
            .filter(entry -> entry.getValue() < 60.0)
            .forEach(entry -> weaknesses.add("Cần cải thiện môn " + entry.getKey()));
        
        // Phân tích điểm thấp
        long lowScores = results.stream()
            .filter(result -> result.getPercentage() < 50.0)
            .count();
        
        if (lowScores > 0) {
            weaknesses.add("Có " + lowScores + " bài thi dưới trung bình (<50%)");
        }
        
        return weaknesses;
    }

    /**
     * Tính xu hướng tổng thể
     */
    private String calculateOverallTrend(Map<String, Double> monthlyAverages) {
        if (monthlyAverages.size() < 2) return "Cần thêm dữ liệu";
        
        List<Double> values = new ArrayList<>(monthlyAverages.values());
        double firstAvg = values.get(0);
        double lastAvg = values.get(values.size() - 1);
        
        double change = lastAvg - firstAvg;
        
        if (change > 5) return "Tăng trưởng tốt";
        if (change > 0) return "Tăng trưởng nhẹ";
        if (change < -5) return "Giảm sút";
        return "Ổn định";
    }

    /**
     * Lấy tất cả kết quả thi (helper method)
     */
    private List<TestResult> getAllTestResults() throws ExecutionException, InterruptedException {
        // Implementation depends on your data structure
        // This is a simplified version
        return new ArrayList<>();
    }

    /**
     * Tính xu hướng cải thiện
     */
    private String calculateImprovementTrend(List<TestResult> results) {
        if (results.size() < 2) return "Cần thêm dữ liệu";
        
        // Sắp xếp theo thời gian
        results.sort((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()));
        
        // Lấy 3 kết quả gần nhất
        List<TestResult> recentResults = results.subList(Math.max(0, results.size() - 3), results.size());
        
        if (recentResults.size() < 2) return "Cần thêm dữ liệu";
        
        double firstScore = recentResults.get(0).getPercentage();
        double lastScore = recentResults.get(recentResults.size() - 1).getPercentage();
        
        double improvement = lastScore - firstScore;
        
        if (improvement > 5) return "Cải thiện tốt";
        if (improvement > 0) return "Cải thiện nhẹ";
        if (improvement < -5) return "Cần cải thiện";
        return "Ổn định";
    }

    /**
     * Tính median
     */
    private double calculateMedian(double[] values) {
        Arrays.sort(values);
        int n = values.length;
        if (n % 2 == 0) {
            return (values[n/2 - 1] + values[n/2]) / 2.0;
        } else {
            return values[n/2];
        }
    }

    /**
     * Tính standard deviation
     */
    private double calculateStandardDeviation(double[] values) {
        double mean = Arrays.stream(values).average().orElse(0.0);
        double variance = Arrays.stream(values)
            .map(x -> Math.pow(x - mean, 2))
            .average()
            .orElse(0.0);
        return Math.sqrt(variance);
    }
} 