package com.example.backend.imagenpersonalizada;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Endpoint REST CRUD para referencias visuales de encargos. */
@RestController
@RequestMapping("/api/imagenes-trabajo-personalizado")
public class ImagenTrabajoPersonalizadoController {
    private final ImagenTrabajoPersonalizadoService service;

    public ImagenTrabajoPersonalizadoController(ImagenTrabajoPersonalizadoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ImagenTrabajoPersonalizado> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public ImagenTrabajoPersonalizado buscar(@PathVariable UUID id) {
        return service.buscar(id, "imagen de trabajo personalizado");
    }

    @PostMapping
    public ResponseEntity<ImagenTrabajoPersonalizado> crear(
            @Valid @RequestBody ImagenTrabajoPersonalizado solicitud) {
        ImagenTrabajoPersonalizado creada = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/imagenes-trabajo-personalizado/" + creada.id()))
                .body(creada);
    }

    @PutMapping("/{id}")
    public ImagenTrabajoPersonalizado actualizar(
            @PathVariable UUID id, @Valid @RequestBody ImagenTrabajoPersonalizado solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "imagen de trabajo personalizado");
        return ResponseEntity.noContent().build();
    }
}
