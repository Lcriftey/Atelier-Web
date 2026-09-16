package com.example.backend.imagenobra;

import com.example.backend.obra.ObraService;
import com.example.backend.shared.AbstractCrudService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** CRUD de imagenes y validacion de la obra propietaria. */
@Service
public class ImagenObraService extends AbstractCrudService<ImagenObra> {
    private final ObraService obraService;

    public ImagenObraService(ObraService obraService) {
        this.obraService = obraService;
    }

    public ImagenObra crear(ImagenObra solicitud) {
        obraService.buscar(solicitud.obraId(), "obra");
        UUID id = UUID.randomUUID();
        return guardar(id, new ImagenObra(id, solicitud.obraId(), solicitud.urlImagen(),
                solicitud.textoAlternativo(), solicitud.ordenVisualizacion(), solicitud.esPrincipal(),
                OffsetDateTime.now()));
    }

    public ImagenObra actualizar(UUID id, ImagenObra solicitud) {
        ImagenObra actual = buscar(id, "imagen de obra");
        obraService.buscar(solicitud.obraId(), "obra");
        return guardar(id, new ImagenObra(id, solicitud.obraId(), solicitud.urlImagen(),
                solicitud.textoAlternativo(), solicitud.ordenVisualizacion(), solicitud.esPrincipal(),
                actual.creadoEn()));
    }
}
