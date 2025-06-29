package com.yourcompany.onlineexam.model;

import java.util.Date;
import java.util.List;

public class Test {
    private String id;
    private String name;
    private String description;
    private String courseId;
    private String courseName;
    private String partId;
    private String partName;
    private String questionBankId;
    private String questionBankName;
    private Integer totalQuestions;
    private Integer timeLimit; // Thời gian làm bài (phút)
    private Integer totalScore; // Tổng điểm
    private String difficulty; // easy, medium, hard, mixed
    private List<TestQuestion> questions; // Danh sách câu hỏi được chọn
    private Date startDate;
    private Date endDate;
    private Boolean isActive;
    private Boolean showAnswers; // Hiển thị đáp án sau khi làm bài
    private Date createdAt;
    private Date updatedAt;

    public Test() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getPartId() { return partId; }
    public void setPartId(String partId) { this.partId = partId; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getQuestionBankId() { return questionBankId; }
    public void setQuestionBankId(String questionBankId) { this.questionBankId = questionBankId; }

    public String getQuestionBankName() { return questionBankName; }
    public void setQuestionBankName(String questionBankName) { this.questionBankName = questionBankName; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }

    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<TestQuestion> getQuestions() { return questions; }
    public void setQuestions(List<TestQuestion> questions) { this.questions = questions; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getShowAnswers() { return showAnswers; }
    public void setShowAnswers(Boolean showAnswers) { this.showAnswers = showAnswers; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    // Inner class để lưu thông tin câu hỏi trong bài thi
    public static class TestQuestion {
        private String questionId;
        private String content;
        private String type;
        private String level;
        private Integer score; // Điểm cho câu hỏi này
        private List<Question.Option> options;

        public TestQuestion() {}

        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }

        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }

        public List<Question.Option> getOptions() { return options; }
        public void setOptions(List<Question.Option> options) { this.options = options; }
    }
} 