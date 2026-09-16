package com.example.backend.imagenpersonalizada;

import com.example.backend.shared.AbstractCrudService;
import com.example.backend.solicitudpersonalizada.SolicitudTrabajoPersonalizadoService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** CRUD de imagenes de referencia de trabajos personalizados. */
@Service
public class ImagenTrabajoPersonalizadoService extends AbstractCrudService<ImagenTrabajoPersonalizado> {
    private final SolicitudTrabajoPersonalizadoService solicitudService;

    public ImagenTrabajoPersonalizadoService(SolicitudTrabajoPersonalizadoService solicitudService) {
        this.solicitudService = solicitudService;
    }

    public ImagenTrabajoPersonalizado crear(ImagenTrabajoPersonalizado solicitud) {
        solicitudService.buscar(solicitud.solicitudId(), "solicitud de trabajo personalizado");
        UUID id = UUID.randomUUID();
        return guardar(id, new ImagenTrabajoPersonalizado(id, solicitud.solicitudId(),
                solicitud.urlImagen(), solicitud.nombreArchivoOriginal(), solicitud.textoAlternativo(),
                OffsetDateTime.now()));
    }

    public ImagenTrabajoPersonalizado actualizar(UUID id, ImagenTrabajoPersonalizado solicitud) {
        ImagenTrabajoPersonalizado actual = buscar(id, "imagen de trabajo personalizado");
        solicitudService.buscar(solicitud.solicitudId(), "solicitud de trabajo personalizado");
        return guardar(id, new ImagenTrabajoPersonalizado(id, solicitud.solicitudId(),
                solicitud.urlImagen(), solicitud.nombreArchivoOriginal(), solicitud.textoAlternativo(),
                actual.creadoEn()));
    }
}
