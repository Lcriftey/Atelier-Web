package com.example.backend.imagenobra;

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

/** Endpoint REST CRUD para imagenes asociadas a obras. */
@RestController
@RequestMapping("/api/imagenes-obra")
public class ImagenObraController {
    private final ImagenObraService service;

    public ImagenObraController(ImagenObraService service) {
        this.service = service;
    }

    @GetMapping
    public List<ImagenObra> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public ImagenObra buscar(@PathVariable UUID id) { return service.buscar(id, "imagen de obra"); }

    @PostMapping
    public ResponseEntity<ImagenObra> crear(@Valid @RequestBody ImagenObra solicitud) {
        ImagenObra creada = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/imagenes-obra/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public ImagenObra actualizar(@PathVariable UUID id, @Valid @RequestBody ImagenObra solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "imagen de obra");
        return ResponseEntity.noContent().build();
    }
}
