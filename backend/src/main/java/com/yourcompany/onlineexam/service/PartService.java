package com.yourcompany.onlineexam.service;

import com.yourcompany.onlineexam.model.Part;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class PartService {
    private static final String COLLECTION_NAME = "parts";

    public List<Part> getAllParts() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Part> parts = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            Part part = doc.toObject(Part.class);
            part.setId(doc.getId());
            parts.add(part);
        }
        return parts;
    }

    public Part getPartById(String id) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot doc = docRef.get().get();
        if (doc.exists()) {
            Part part = doc.toObject(Part.class);
            part.setId(doc.getId());
            return part;
        }
        return null;
    }

    public Part createPart(Part part) throws ExecutionException, InterruptedException {
        // Kiểm tra trùng tên trong cùng một môn học
        if (isDuplicateName(part.getName(), part.getCourseId(), null)) {
            throw new IllegalArgumentException("Tên bài thi đã tồn tại trong môn học này!");
        }
        part.setCreatedAt(new Date());
        part.setUpdatedAt(new Date());
        // Đảm bảo trường questions và score được lưu
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<DocumentReference> future = db.collection(COLLECTION_NAME).add(part);
        String id = future.get().getId();
        part.setId(id);
        db.collection(COLLECTION_NAME).document(id).set(part);
        return part;
    }

    public Part updatePart(String id, Part part) throws ExecutionException, InterruptedException {
        // Kiểm tra trùng tên trong cùng một môn học (trừ chính nó)
        if (isDuplicateName(part.getName(), part.getCourseId(), id)) {
            throw new IllegalArgumentException("Tên bài thi đã tồn tại trong môn học này!");
        }
        part.setUpdatedAt(new Date());
        // Đảm bảo trường questions và score được lưu
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(id);
        docRef.set(part);
        part.setId(id);
        return part;
    }

    public void deletePart(String id) {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(id).delete();
    }

    public boolean isDuplicateName(String name, String courseId, String ignoreId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference parts = db.collection(COLLECTION_NAME);
        Query query = parts.whereEqualTo("courseId", courseId).whereEqualTo("name", name);
        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        for (QueryDocumentSnapshot doc : docs) {
            if (!doc.getId().equals(ignoreId)) {
                return true;
            }
        }
        return false;
    }

    public List<Part> searchParts(String keyword) throws ExecutionException, InterruptedException {
        List<Part> all = getAllParts();
        String lower = keyword.trim().toLowerCase();
        List<Part> result = new ArrayList<>();
        for (Part p : all) {
            if (p.getName().toLowerCase().contains(lower) || p.getCourseId().toLowerCase().contains(lower)) {
                result.add(p);
            }
        }
        return result;
    }
} 