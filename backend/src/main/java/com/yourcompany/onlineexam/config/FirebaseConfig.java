package com.yourcompany.onlineexam.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_SERVICE_ACCOUNT_BASE64}")
    private String serviceAccountBase64;

    @Value("${FIREBASE_PROJECT_ID}")
    private String projectId;

    @Bean
    public Firestore firestore() throws IOException {
        // Decode từ BASE64 → InputStream
        byte[] decodedBytes = Base64.getDecoder().decode(serviceAccountBase64);
        InputStream serviceAccount = new ByteArrayInputStream(decodedBytes);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setDatabaseUrl("https://" + projectId + "-default-rtdb.firebaseio.com")
                .setProjectId(projectId)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }

        return FirestoreClient.getFirestore();
    }

    @Bean
    public FirebaseDatabase firebaseDatabase() throws IOException {
        // Đảm bảo Firestore đã được khởi tạo
        firestore();
        return FirebaseDatabase.getInstance();
    }
}
