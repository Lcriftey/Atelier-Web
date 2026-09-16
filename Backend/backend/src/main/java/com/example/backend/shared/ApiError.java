package com.example.backend.shared;

import java.time.Instant;
import java.util.List;

/** Respuesta uniforme para errores de la API. */
public record ApiError(
        Instant timestamp,
        int status,
        String message,
        List<String> details
) {
}
