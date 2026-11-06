package com.example.backend;

import com.example.backend.imagenobra.ImagenObra;
import com.example.backend.imagenobra.ImagenObraService;
import com.example.backend.obra.EstadoObra;
import com.example.backend.obra.Obra;
import com.example.backend.obra.ObraService;
import com.example.backend.shared.ResourceNotFoundException;
import com.example.backend.solicitudclase.EstadoSolicitudClase;
import com.example.backend.solicitudclase.SolicitudClase;
import com.example.backend.solicitudclase.SolicitudClaseService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CrudServicesTests {
    @Test
    void creaObraConIdYFechas() {
        ObraService service = new ObraService();
        Obra solicitud = new Obra(null, "Obra", "Descripcion", "Tecnica",
                BigDecimal.ONE, "COP", EstadoObra.NO_DISPONIBLE,
                LocalDate.of(2026, 9, 11), null, null, null);

        Obra creada = service.crear(solicitud);

        assertNotNull(creada.id());
        assertNotNull(creada.creadoEn());
        assertEquals("Obra", service.buscar(creada.id(), "obra").nombre());
    }

    @Test
    void fuerzaEstadoSolicitadaAlCrearClase() {
        SolicitudClaseService service = new SolicitudClaseService();
        SolicitudClase solicitud = new SolicitudClase(null, "Ana", "+57300", null,
                LocalDate.of(2026, 10, 1), LocalTime.NOON, "Dibujo", 1,
                null, null, EstadoSolicitudClase.CONFIRMADA, null, null);

        SolicitudClase creada = service.crear(solicitud);

        assertEquals(EstadoSolicitudClase.SOLICITADA, creada.estado());
    }

    @Test
    void rechazaImagenCuandoLaObraNoExiste() {
        ImagenObraService service = new ImagenObraService(new ObraService());
        ImagenObra solicitud = new ImagenObra(null, UUID.randomUUID(), "https://example.com/obra.jpg",
                "Imagen de obra", 0, true, null);

        assertThrows(ResourceNotFoundException.class, () -> service.crear(solicitud));
    }

        @Test
        void asignaOrdenSecuencialYReservaCeroParaLaImagenPrincipal() {
        ObraService obraService = new ObraService();
        Obra obra = obraService.crear(new Obra(null, "Obra", "Descripcion", "Tecnica",
            BigDecimal.ONE, "COP", EstadoObra.NO_DISPONIBLE,
            LocalDate.of(2026, 9, 11), null, null, null));
        ImagenObraService imagenService = new ImagenObraService(obraService);

        ImagenObra primera = imagenService.crear(new ImagenObra(null, obra.id(), "https://example.com/1.jpg",
            obra.nombre(), 0, false, null));
        ImagenObra segunda = imagenService.crear(new ImagenObra(null, obra.id(), "https://example.com/2.jpg",
            obra.nombre(), 0, false, null));
        ImagenObra principal = imagenService.crear(new ImagenObra(null, obra.id(), "https://example.com/main.jpg",
            obra.nombre(), 0, true, null));

        assertEquals(1, imagenService.buscar(primera.id(), "imagen").ordenVisualizacion());
        assertEquals(2, imagenService.buscar(segunda.id(), "imagen").ordenVisualizacion());
        assertEquals(0, principal.ordenVisualizacion());
        assertEquals(1, imagenService.listar().stream().filter(ImagenObra::esPrincipal).count());
        }
}
