# --- STAGE 1: BUILD STAGE (Compiles and Packages the Application) ---
FROM maven:3.9.5-eclipse-temurin-21-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the project files needed to download dependencies
# This is a key step for Docker layer caching
COPY pom.xml .

# Pre-download dependencies by running the package goal.
# If dependencies don't change, Docker skips this layer.
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

# Copy all remaining source code
COPY src src

# Package the application into a single JAR file
RUN mvn package -DskipTests

# --- STAGE 2: RUNTIME STAGE (Runs the Final JAR) ---
# Use a JRE (Java Runtime Environment) base image for a much smaller final image
FROM eclipse-temurin:21-jre-alpine

# Set the working directory
WORKDIR /app

# Copy the final JAR file from the 'build' stage
# The 'build' stage is referenced by its name
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Define the command to run the application
# Environment variables from Docker Compose will be read by Spring Boot here
ENTRYPOINT ["java", "-jar", "app.jar"]