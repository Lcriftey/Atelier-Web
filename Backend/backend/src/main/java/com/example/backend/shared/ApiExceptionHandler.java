package com.example.backend.shared;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

/**
 * Convierte errores de validacion y recursos inexistentes en respuestas JSON
 * consistentes. Esto evita repetir el mismo manejo en cada controlador.
 */
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage(), List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleInvalidBody(MethodArgumentNotValidException exception) {
        List<String> details = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return response(HttpStatus.BAD_REQUEST, "El cuerpo de la solicitud no es valido", details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException exception) {
        return response(HttpStatus.BAD_REQUEST, "Los parametros de la solicitud no son validos", List.of(exception.getMessage()));
    }

    private ResponseEntity<ApiError> response(HttpStatus status, String message, List<String> details) {
        return ResponseEntity.status(status)
                .body(new ApiError(Instant.now(), status.value(), message, details));
    }
}
