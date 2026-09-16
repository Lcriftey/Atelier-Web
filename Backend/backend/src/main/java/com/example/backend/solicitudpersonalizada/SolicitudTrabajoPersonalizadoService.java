package com.example.backend.solicitudpersonalizada;

import com.example.backend.shared.AbstractCrudService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** CRUD de solicitudes de encargos personalizados. */
@Service
public class SolicitudTrabajoPersonalizadoService extends AbstractCrudService<SolicitudTrabajoPersonalizado> {
    public SolicitudTrabajoPersonalizado crear(SolicitudTrabajoPersonalizado solicitud) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return guardar(id, new SolicitudTrabajoPersonalizado(id, solicitud.nombreCliente(),
                solicitud.numeroWhatsapp(), solicitud.correoElectronico(), solicitud.descripcionProyecto(),
                solicitud.tecnicaDeseada(), solicitud.materialDeseado(), solicitud.tamanoDeseado(),
                solicitud.fechaDeseada(), solicitud.referenciaPresupuesto(), solicitud.observacionesAdicionales(),
                EstadoSolicitudTrabajoPersonalizado.RECIBIDA, now, now));
    }

    public SolicitudTrabajoPersonalizado actualizar(UUID id, SolicitudTrabajoPersonalizado solicitud) {
        SolicitudTrabajoPersonalizado actual = buscar(id, "solicitud de trabajo personalizado");
        return guardar(id, new SolicitudTrabajoPersonalizado(id, solicitud.nombreCliente(),
                solicitud.numeroWhatsapp(), solicitud.correoElectronico(), solicitud.descripcionProyecto(),
                solicitud.tecnicaDeseada(), solicitud.materialDeseado(), solicitud.tamanoDeseado(),
                solicitud.fechaDeseada(), solicitud.referenciaPresupuesto(), solicitud.observacionesAdicionales(),
                solicitud.estado(), actual.creadoEn(), OffsetDateTime.now()));
    }
}
