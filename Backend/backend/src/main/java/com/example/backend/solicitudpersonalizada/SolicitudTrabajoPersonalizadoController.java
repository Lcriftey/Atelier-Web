package com.example.backend.solicitudpersonalizada;

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

/** Endpoint REST CRUD para encargos personalizados. */
@RestController
@RequestMapping("/api/solicitudes-trabajo-personalizado")
public class SolicitudTrabajoPersonalizadoController {
    private final SolicitudTrabajoPersonalizadoService service;

    public SolicitudTrabajoPersonalizadoController(SolicitudTrabajoPersonalizadoService service) {
        this.service = service;
    }

    @GetMapping
    public List<SolicitudTrabajoPersonalizado> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public SolicitudTrabajoPersonalizado buscar(@PathVariable UUID id) {
        return service.buscar(id, "solicitud de trabajo personalizado");
    }

    @PostMapping
    public ResponseEntity<SolicitudTrabajoPersonalizado> crear(
            @Valid @RequestBody SolicitudTrabajoPersonalizado solicitud) {
        SolicitudTrabajoPersonalizado creada = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/solicitudes-trabajo-personalizado/" + creada.id()))
                .body(creada);
    }

    @PutMapping("/{id}")
    public SolicitudTrabajoPersonalizado actualizar(
            @PathVariable UUID id, @Valid @RequestBody SolicitudTrabajoPersonalizado solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "solicitud de trabajo personalizado");
        return ResponseEntity.noContent().build();
    }
}
