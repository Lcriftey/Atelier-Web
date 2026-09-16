package com.example.backend.obra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Modelo de una obra del catalogo. Preparado para mapearse a la tabla obras. */
public record Obra(
        UUID id,
        @NotBlank @Size(max = 200) String nombre,
        @NotBlank String descripcionArtistica,
        @NotBlank String descripcionTecnica,
        @NotNull @DecimalMin("0.00") BigDecimal precio,
        @NotBlank @Size(min = 3, max = 3) String moneda,
        @NotNull EstadoObra estado,
        @NotNull LocalDate fechaPublicacion,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn,
        OffsetDateTime eliminadoEn
) {
}
