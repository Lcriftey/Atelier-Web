package com.example.backend.imagenpersonalizada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Imagen de referencia perteneciente a un encargo personalizado. */
public record ImagenTrabajoPersonalizado(
        UUID id,
        @NotNull UUID solicitudId,
        @NotBlank String urlImagen,
        @Size(max = 255) String nombreArchivoOriginal,
        @Size(max = 300) String textoAlternativo,
        OffsetDateTime creadoEn
) {
}
