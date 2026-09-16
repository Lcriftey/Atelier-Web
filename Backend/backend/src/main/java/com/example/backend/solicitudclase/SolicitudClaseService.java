package com.example.backend.solicitudclase;

import com.example.backend.shared.AbstractCrudService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** CRUD de solicitudes de clase. No confirma reservas ni procesa pagos. */
@Service
public class SolicitudClaseService extends AbstractCrudService<SolicitudClase> {
    public SolicitudClase crear(SolicitudClase solicitud) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return guardar(id, new SolicitudClase(id, solicitud.nombreCliente(), solicitud.numeroWhatsapp(),
                solicitud.correoElectronico(), solicitud.fechaSolicitada(), solicitud.horaSolicitada(),
                solicitud.tipoClase(), solicitud.cantidadEstudiantes(), solicitud.descripcionSolicitud(),
                solicitud.observacionesAdicionales(), EstadoSolicitudClase.SOLICITADA, now, now));
    }

    public SolicitudClase actualizar(UUID id, SolicitudClase solicitud) {
        SolicitudClase actual = buscar(id, "solicitud de clase");
        return guardar(id, new SolicitudClase(id, solicitud.nombreCliente(), solicitud.numeroWhatsapp(),
                solicitud.correoElectronico(), solicitud.fechaSolicitada(), solicitud.horaSolicitada(),
                solicitud.tipoClase(), solicitud.cantidadEstudiantes(), solicitud.descripcionSolicitud(),
                solicitud.observacionesAdicionales(), solicitud.estado(), actual.creadoEn(), OffsetDateTime.now()));
    }
}
