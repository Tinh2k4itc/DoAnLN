package com.yourcompany.onlineexam.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.yourcompany.onlineexam.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {
    private static final String COLLECTION_NAME = "users";

    public List<User> getAll() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        List<User> users = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            User user = doc.toObject(User.class);
            users.add(user);
        }
        return users;
    }

    public User create(User user) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<DocumentReference> future = db.collection(COLLECTION_NAME).add(user);
        String id = future.get().getId();
        user.setUid(id);
        db.collection(COLLECTION_NAME).document(id).set(user);
        return user;
    }

    public User update(String uid, User user) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(uid).set(user);
        return user;
    }

    public void delete(String uid) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(COLLECTION_NAME).document(uid).delete();
    }

    public User changeRole(String uid, String role) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference ref = db.collection(COLLECTION_NAME).document(uid);
        ref.update("role", role);
        User user = ref.get().get().toObject(User.class);
        return user;
    }

    public User disableUser(String uid, boolean isDeleted) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference ref = db.collection(COLLECTION_NAME).document(uid);
        ref.update("isDeleted", isDeleted);
        User user = ref.get().get().toObject(User.class);
        return user;
    }
} 