// backend/src/main/java/com/yourcompany/onlineexam/service/CourseService.java

package com.yourcompany.onlineexam.service;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.yourcompany.onlineexam.model.Course;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
 
@Service
public class CourseService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "courses";

    public CourseService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Course> getAllCourses() throws ExecutionException, InterruptedException {
        List<Course> courses = new ArrayList<>();
        CollectionReference courseCollection = firestore.collection(COLLECTION_NAME);
        for (QueryDocumentSnapshot document : courseCollection.get().get().getDocuments()) {
            courses.add(document.toObject(Course.class));
        }
        return courses;
    }

    public Course createCourse(Course course) throws ExecutionException, InterruptedException {
        DocumentReference documentReference = firestore.collection(COLLECTION_NAME).document();
        course.setId(documentReference.getId());
        documentReference.set(course).get();
        return course;
    }
    
    // =================== CODE MỚI THÊM VÀO ===================

    /**
     * Cập nhật thông tin một môn học đã có
     * @param subjectId ID của môn học cần cập nhật
     * @param subjectDetails Đối tượng Subject chứa thông tin mới
     * @return Đối tượng Subject đã được cập nhật
     */
    public Course updateCourse(String courseId, Course courseDetails) throws ExecutionException, InterruptedException {
        DocumentReference documentReference = firestore.collection(COLLECTION_NAME).document(courseId);
        // Đảm bảo ID trong object cũng được cập nhật đúng
        courseDetails.setId(courseId); 
        documentReference.set(courseDetails).get();
        return courseDetails;
    }

    /**
     * Xóa một môn học dựa trên ID
     * @param subjectId ID của môn học cần xóa
     */
    public void deleteCourse(String courseId) {
        firestore.collection(COLLECTION_NAME).document(courseId).delete();
    }

    // =================== QUẢN LÝ SINH VIÊN TRONG MÔN HỌC ===================
    public List<String> getStudentsOfCourse(String courseId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(courseId);
        DocumentSnapshot snapshot = docRef.get().get();
        Course course = snapshot.toObject(Course.class);
        if (course != null && course.getStudents() != null) {
            return course.getStudents();
        }
        return new ArrayList<>();
    }

    public void addStudentToCourse(String courseId, String studentId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(courseId);
        DocumentSnapshot snapshot = docRef.get().get();
        Course course = snapshot.toObject(Course.class);
        if (course == null) return;
        List<String> students = course.getStudents();
        if (students == null) students = new ArrayList<>();
        if (!students.contains(studentId)) {
            students.add(studentId);
            course.setStudents(students);
            docRef.set(course).get();
        }
    }

    public void removeStudentFromCourse(String courseId, String studentId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(courseId);
        DocumentSnapshot snapshot = docRef.get().get();
        Course course = snapshot.toObject(Course.class);
        if (course == null) return;
        List<String> students = course.getStudents();
        if (students != null && students.contains(studentId)) {
            students.remove(studentId);
            course.setStudents(students);
            docRef.set(course).get();
        }
    }

    // ==========================================================
}