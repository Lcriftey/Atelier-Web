package com.example.backend.solicitudclase;

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

/** Endpoint REST CRUD para solicitudes de clases. */
@RestController
@RequestMapping("/api/solicitudes-clase")
public class SolicitudClaseController {
    private final SolicitudClaseService service;

    public SolicitudClaseController(SolicitudClaseService service) {
        this.service = service;
    }

    @GetMapping
    public List<SolicitudClase> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public SolicitudClase buscar(@PathVariable UUID id) { return service.buscar(id, "solicitud de clase"); }

    @PostMapping
    public ResponseEntity<SolicitudClase> crear(@Valid @RequestBody SolicitudClase solicitud) {
        SolicitudClase creada = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/solicitudes-clase/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public SolicitudClase actualizar(@PathVariable UUID id, @Valid @RequestBody SolicitudClase solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "solicitud de clase");
        return ResponseEntity.noContent().build();
    }
}
