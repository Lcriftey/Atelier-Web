package com.example.backend.obra;

import com.example.backend.shared.AbstractCrudService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Casos de uso CRUD y reglas de negocio del catalogo de obras. */
@Service
public class ObraService extends AbstractCrudService<Obra> {
    public Obra crear(Obra solicitud) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return guardar(id, new Obra(id, solicitud.nombre(), solicitud.descripcionArtistica(),
                solicitud.descripcionTecnica(), solicitud.precio(), solicitud.moneda(),
                solicitud.estado(), solicitud.fechaPublicacion(), now, now, null));
    }

    public Obra actualizar(UUID id, Obra solicitud) {
        Obra actual = buscar(id, "obra");
        return guardar(id, new Obra(id, solicitud.nombre(), solicitud.descripcionArtistica(),
                solicitud.descripcionTecnica(), solicitud.precio(), solicitud.moneda(),
                solicitud.estado(), solicitud.fechaPublicacion(), actual.creadoEn(),
                OffsetDateTime.now(), actual.eliminadoEn()));
    }
}
