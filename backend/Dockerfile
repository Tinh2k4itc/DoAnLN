# Stage 1: Build JAR file
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run app
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/onlineexam-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]