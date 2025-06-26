package com.yourcompany.onlineexam.model;

import lombok.Data;
import java.util.Date;

@Data
public class Course {
    private String id;  // Firestore dùng String ID
    private String code;
    private String name;
    private String description;
    private Integer credits;
    private String department;
    private Date createdAt;
    private Date updatedAt;

    public void setId(String id) {
        this.id = id;
    }
}