package com.yourcompany.onlineexam.model;

import java.util.Date;
import java.util.List;

public class TestResult {
    private String id;
    private String testId;
    private String testName;
    private String userId;
    private String userName;
    private String userEmail;
    private String courseId;
    private String courseName;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer totalScore;
    private Integer earnedScore;
    private Double percentage;
    private String grade; // A, B, C, D, F
    private Date startTime;
    private Date endTime;
    private Integer timeSpent; // Thời gian làm bài (phút)
    private Boolean isCompleted;
    private Boolean isPassed;
    private List<AnswerDetail> answers;
    private Date createdAt;
    private Date updatedAt;

    public TestResult() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public Integer getEarnedScore() { return earnedScore; }
    public void setEarnedScore(Integer earnedScore) { this.earnedScore = earnedScore; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }

    public Integer getTimeSpent() { return timeSpent; }
    public void setTimeSpent(Integer timeSpent) { this.timeSpent = timeSpent; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public Boolean getIsPassed() { return isPassed; }
    public void setIsPassed(Boolean isPassed) { this.isPassed = isPassed; }

    public List<AnswerDetail> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDetail> answers) { this.answers = answers; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    // Inner class để lưu chi tiết từng câu trả lời
    public static class AnswerDetail {
        private String questionId;
        private String questionContent;
        private String questionType;
        private String userAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private Integer questionScore;
        private Integer earnedScore;
        private List<String> userSelectedOptions;
        private List<String> correctOptions;

        public AnswerDetail() {}

        // Getters and Setters
        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }

        public String getQuestionContent() { return questionContent; }
        public void setQuestionContent(String questionContent) { this.questionContent = questionContent; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }

        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

        public Boolean getIsCorrect() { return isCorrect; }
        public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }

        public Integer getQuestionScore() { return questionScore; }
        public void setQuestionScore(Integer questionScore) { this.questionScore = questionScore; }

        public Integer getEarnedScore() { return earnedScore; }
        public void setEarnedScore(Integer earnedScore) { this.earnedScore = earnedScore; }

        public List<String> getUserSelectedOptions() { return userSelectedOptions; }
        public void setUserSelectedOptions(List<String> userSelectedOptions) { this.userSelectedOptions = userSelectedOptions; }

        public List<String> getCorrectOptions() { return correctOptions; }
        public void setCorrectOptions(List<String> correctOptions) { this.correctOptions = correctOptions; }
    }
} 