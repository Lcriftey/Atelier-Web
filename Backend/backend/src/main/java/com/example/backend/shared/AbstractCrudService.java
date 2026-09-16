package com.example.backend.shared;

import java.util.List;
import java.util.UUID;

/**
 * Operaciones CRUD comunes. La persistencia esta encapsulada en CrudStore para
 * poder reemplazarla mas adelante por un repositorio de Supabase.
 */
public abstract class AbstractCrudService<T> {
    private final CrudStore<T> store = new CrudStore<>();

    public List<T> listar() {
        return store.findAll();
    }

    public T buscar(UUID id, String resourceName) {
        T record = store.findById(id);
        if (record == null) {
            throw new ResourceNotFoundException(resourceName, id);
        }
        return record;
    }

    protected T guardar(UUID id, T record) {
        return store.save(id, record);
    }

    public void eliminar(UUID id, String resourceName) {
        if (!store.deleteById(id)) {
            throw new ResourceNotFoundException(resourceName, id);
        }
    }

    protected boolean existe(UUID id) {
        return store.findById(id) != null;
    }
}
