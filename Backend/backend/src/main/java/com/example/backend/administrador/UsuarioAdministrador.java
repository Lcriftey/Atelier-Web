package com.example.backend.administrador;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Usuario autorizado para el panel administrativo. */
public record UsuarioAdministrador(
        UUID id,
        @NotBlank @Email @Size(max = 254) String correoElectronico,
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        @NotBlank String hashContrasena,
        @NotBlank @Size(max = 150) String nombreCompleto,
        boolean estaActivo,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn
) {
}
