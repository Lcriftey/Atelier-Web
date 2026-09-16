package com.example.backend.imagenobra;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Imagen asociada a una obra del catalogo. */
public record ImagenObra(
        UUID id,
        @NotNull UUID obraId,
        @NotBlank String urlImagen,
        @NotBlank @Size(max = 300) String textoAlternativo,
        @NotNull @Min(0) Integer ordenVisualizacion,
        boolean esPrincipal,
        OffsetDateTime creadoEn
) {
}
