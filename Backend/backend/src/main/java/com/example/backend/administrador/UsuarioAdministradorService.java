package com.example.backend.administrador;

import com.example.backend.shared.AbstractCrudService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** CRUD de administradores. El hash nunca se serializa en respuestas JSON. */
@Service
public class UsuarioAdministradorService extends AbstractCrudService<UsuarioAdministrador> {
    public UsuarioAdministrador crear(UsuarioAdministrador solicitud) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        return guardar(id, new UsuarioAdministrador(id, solicitud.correoElectronico(),
                solicitud.hashContrasena(), solicitud.nombreCompleto(), true, now, now));
    }

    public UsuarioAdministrador actualizar(UUID id, UsuarioAdministrador solicitud) {
        UsuarioAdministrador actual = buscar(id, "usuario administrador");
        String hash = solicitud.hashContrasena() == null || solicitud.hashContrasena().isBlank()
                ? actual.hashContrasena()
                : solicitud.hashContrasena();
        return guardar(id, new UsuarioAdministrador(id, solicitud.correoElectronico(), hash,
                solicitud.nombreCompleto(), solicitud.estaActivo(), actual.creadoEn(), OffsetDateTime.now()));
    }
}
