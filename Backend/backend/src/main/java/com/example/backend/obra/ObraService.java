package com.example.backend.obra;

import com.example.backend.shared.AbstractCrudService;
import com.example.backend.shared.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Casos de uso CRUD y reglas de negocio del catalogo de obras. */
@Service
public class ObraService extends AbstractCrudService<Obra> {
    private JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Obra> listar() {
        if (jdbcTemplate == null) return super.listar();
        return jdbcTemplate.query("""
                SELECT "id", "nombre", "descripcionArtistica", "descripcionTecnica", "dimensiones",
                       "precio", "moneda", "estado", "fechaPublicacion", "creadoEn",
                       "actualizadoEn", "eliminadoEn"
                FROM "obras" WHERE "eliminadoEn" IS NULL
                ORDER BY "fechaPublicacion" DESC, "creadoEn" DESC
                """, this::mapRow);
    }

    @Override
    public Obra buscar(UUID id, String resourceName) {
        if (jdbcTemplate == null) return super.buscar(id, resourceName);
        List<Obra> obras = jdbcTemplate.query("""
                SELECT "id", "nombre", "descripcionArtistica", "descripcionTecnica", "dimensiones",
                       "precio", "moneda", "estado", "fechaPublicacion", "creadoEn",
                       "actualizadoEn", "eliminadoEn"
                FROM "obras" WHERE "id" = ? AND "eliminadoEn" IS NULL
                """, this::mapRow, id);
        if (obras.isEmpty()) throw new ResourceNotFoundException(resourceName, id);
        return obras.getFirst();
    }

    public Obra crear(Obra solicitud) {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        Obra creada = new Obra(id, solicitud.nombre(), solicitud.descripcionArtistica(),
                solicitud.descripcionTecnica(), solicitud.dimensiones(), solicitud.precio(), solicitud.moneda(),
                solicitud.estado(), solicitud.fechaPublicacion(), now, now, null);
        if (jdbcTemplate == null) return guardar(id, creada);
        jdbcTemplate.update("""
                INSERT INTO "obras" ("id", "nombre", "descripcionArtistica", "descripcionTecnica", "dimensiones",
                    "precio", "moneda", "estado", "fechaPublicacion", "creadoEn", "actualizadoEn")
                VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS "estadoObra"), ?, ?, ?)
                """, creada.id(), creada.nombre(), creada.descripcionArtistica(), creada.descripcionTecnica(), creada.dimensiones(),
                creada.precio(), creada.moneda(), creada.estado().name(), creada.fechaPublicacion(), now, now);
        return creada;
    }

    public Obra actualizar(UUID id, Obra solicitud) {
        Obra actual = buscar(id, "obra");
        Obra actualizada = new Obra(id, solicitud.nombre(), solicitud.descripcionArtistica(),
                solicitud.descripcionTecnica(), solicitud.dimensiones(), solicitud.precio(), solicitud.moneda(),
                solicitud.estado(), solicitud.fechaPublicacion(), actual.creadoEn(),
                OffsetDateTime.now(), actual.eliminadoEn());
        if (jdbcTemplate == null) return guardar(id, actualizada);
        jdbcTemplate.update("""
                UPDATE "obras" SET "nombre" = ?, "descripcionArtistica" = ?, "descripcionTecnica" = ?, "dimensiones" = ?,
                    "precio" = ?, "moneda" = ?, "estado" = CAST(? AS "estadoObra"),
                    "fechaPublicacion" = ?, "actualizadoEn" = ? WHERE "id" = ?
                """, actualizada.nombre(), actualizada.descripcionArtistica(), actualizada.descripcionTecnica(), actualizada.dimensiones(),
                actualizada.precio(), actualizada.moneda(), actualizada.estado().name(), actualizada.fechaPublicacion(),
                actualizada.actualizadoEn(), id);
        return actualizada;
    }

    @Override
    public void eliminar(UUID id, String resourceName) {
        if (jdbcTemplate == null) {
            super.eliminar(id, resourceName);
            return;
        }
        if (jdbcTemplate.update("DELETE FROM \"obras\" WHERE \"id\" = ?", id) == 0) {
            throw new ResourceNotFoundException(resourceName, id);
        }
    }

    private Obra mapRow(ResultSet row, int rowNumber) throws SQLException {
        return new Obra(row.getObject("id", UUID.class), row.getString("nombre"),
                row.getString("descripcionArtistica"), row.getString("descripcionTecnica"), row.getString("dimensiones"),
                row.getBigDecimal("precio"), row.getString("moneda").trim(),
                EstadoObra.valueOf(row.getString("estado")), row.getObject("fechaPublicacion", java.time.LocalDate.class),
                row.getObject("creadoEn", OffsetDateTime.class), row.getObject("actualizadoEn", OffsetDateTime.class),
                row.getObject("eliminadoEn", OffsetDateTime.class));
    }
}
