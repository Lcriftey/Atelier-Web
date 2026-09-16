package com.example.backend.solicitudpersonalizada;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Solicitud de un encargo; no crea cotizacion ni transaccion automatica. */
public record SolicitudTrabajoPersonalizado(
        UUID id,
        @NotBlank @Size(max = 150) String nombreCliente,
        @NotBlank @Size(max = 30) String numeroWhatsapp,
        @Email @Size(max = 254) String correoElectronico,
        @NotBlank String descripcionProyecto,
        @Size(max = 120) String tecnicaDeseada,
        @Size(max = 120) String materialDeseado,
        @Size(max = 120) String tamanoDeseado,
        LocalDate fechaDeseada,
        String referenciaPresupuesto,
        String observacionesAdicionales,
        @NotNull EstadoSolicitudTrabajoPersonalizado estado,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn
) {
}
