package com.example.backend.solicitudclase;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Solicitud de clase; no representa una reserva confirmada. */
public record SolicitudClase(
        UUID id,
        @NotBlank @Size(max = 150) String nombreCliente,
        @NotBlank @Size(max = 30) String numeroWhatsapp,
        @Email @Size(max = 254) String correoElectronico,
        @NotNull LocalDate fechaSolicitada,
        @NotNull LocalTime horaSolicitada,
        @NotBlank @Size(max = 120) String tipoClase,
        @Min(1) Integer cantidadEstudiantes,
        String descripcionSolicitud,
        String observacionesAdicionales,
        @NotNull EstadoSolicitudClase estado,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn
) {
}
