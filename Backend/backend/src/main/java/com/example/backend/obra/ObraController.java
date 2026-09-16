package com.example.backend.obra;

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

/** Endpoint REST CRUD para el catalogo de obras. */
@RestController
@RequestMapping("/api/obras")
public class ObraController {
    private final ObraService service;

    public ObraController(ObraService service) {
        this.service = service;
    }

    @GetMapping
    public List<Obra> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Obra buscar(@PathVariable UUID id) { return service.buscar(id, "obra"); }

    @PostMapping
    public ResponseEntity<Obra> crear(@Valid @RequestBody Obra solicitud) {
        Obra creada = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/obras/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public Obra actualizar(@PathVariable UUID id, @Valid @RequestBody Obra solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "obra");
        return ResponseEntity.noContent().build();
    }
}
