// CourseDTO.java
package com.example.coursemanagement.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private String id; // Firestore sử dụng String ID
    private String code;
    private String name;
    private String description;
    private Integer credits;
    private String department;
}