package com.example.backend.shared;

import java.util.UUID;

/** Se lanza cuando una operacion solicita un recurso que no existe. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceName, UUID id) {
        super("No se encontro " + resourceName + " con id " + id);
    }
}
