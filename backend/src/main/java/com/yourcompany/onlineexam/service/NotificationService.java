package com.yourcompany.onlineexam.service;

import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;

@Service
public class NotificationService {

    /**
     * Gửi thông báo khi tạo bài thi mới
     */
    public void notifyNewTest(String testName, String courseName, String userEmail) {
        // TODO: Implement email sending logic
        System.out.println("Thông báo: Bài thi " + testName + " của môn " + courseName + 
                          " đã được tạo và gửi đến " + userEmail);
    }

    /**
     * Gửi thông báo khi có kết quả thi
     */
    public void notifyTestResult(String userName, String testName, Double score, String grade, String userEmail) {
        // TODO: Implement email sending logic
        System.out.println("Thông báo: " + userName + " đã hoàn thành bài thi " + testName + 
                          " với điểm " + score + " (" + grade + ")");
    }

    /**
     * Gửi thông báo nhắc nhở bài thi sắp bắt đầu
     */
    public void notifyTestReminder(String testName, String courseName, Date startTime, String userEmail) {
        // TODO: Implement email sending logic
        System.out.println("Nhắc nhở: Bài thi " + testName + " sẽ bắt đầu lúc " + startTime);
    }

    /**
     * Gửi thông báo khi bài thi bị thay đổi
     */
    public void notifyTestUpdate(String testName, String courseName, String userEmail) {
        // TODO: Implement email sending logic
        System.out.println("Thông báo: Bài thi " + testName + " đã được cập nhật");
    }

    /**
     * Gửi thông báo khi user đăng ký thành công
     */
    public void notifyUserRegistration(String userName, String userEmail) {
        // TODO: Implement email sending logic
        System.out.println("Chào mừng: " + userName + " đã đăng ký thành công");
    }

    /**
     * Gửi thông báo khi có vấn đề với bài thi
     */
    public void notifyTestIssue(String testName, String issue, String adminEmail) {
        // TODO: Implement email sending logic
        System.out.println("Cảnh báo: Bài thi " + testName + " có vấn đề: " + issue);
    }
} 