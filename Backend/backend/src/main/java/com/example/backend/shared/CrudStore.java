package com.example.backend.shared;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Almacen temporal en memoria usado mientras se implementa el adaptador para
 * Supabase. Su API representa las operaciones CRUD que luego implementara el
 * repositorio real.
 */
public class CrudStore<T> {
    private final ConcurrentHashMap<UUID, T> records = new ConcurrentHashMap<>();

    public List<T> findAll() {
        return List.copyOf(records.values());
    }

    public T findById(UUID id) {
        return records.get(id);
    }

    public T save(UUID id, T record) {
        records.put(id, record);
        return record;
    }

    public boolean deleteById(UUID id) {
        return records.remove(id) != null;
    }
}
