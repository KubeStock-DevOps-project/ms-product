# syntax=docker/dockerfile:1.7

FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw \
    && ./mvnw -B -ntp dependency:go-offline

COPY src src
RUN ./mvnw -B -ntp clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/kubestock-ms-product-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]
