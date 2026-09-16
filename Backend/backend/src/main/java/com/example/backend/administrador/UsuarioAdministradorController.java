package com.example.backend.administrador;

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

/** Endpoint REST CRUD para usuarios administradores. Debe protegerse con auth. */
@RestController
@RequestMapping("/api/administradores")
public class UsuarioAdministradorController {
    private final UsuarioAdministradorService service;

    public UsuarioAdministradorController(UsuarioAdministradorService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioAdministrador> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public UsuarioAdministrador buscar(@PathVariable UUID id) {
        return service.buscar(id, "usuario administrador");
    }

    @PostMapping
    public ResponseEntity<UsuarioAdministrador> crear(
            @Valid @RequestBody UsuarioAdministrador solicitud) {
        UsuarioAdministrador creado = service.crear(solicitud);
        return ResponseEntity.created(URI.create("/api/administradores/" + creado.id()))
                .body(creado);
    }

    @PutMapping("/{id}")
    public UsuarioAdministrador actualizar(
            @PathVariable UUID id, @Valid @RequestBody UsuarioAdministrador solicitud) {
        return service.actualizar(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id, "usuario administrador");
        return ResponseEntity.noContent().build();
    }
}
