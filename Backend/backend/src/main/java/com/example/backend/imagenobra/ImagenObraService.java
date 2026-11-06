package com.example.backend.imagenobra;

import com.example.backend.obra.ObraService;
import com.example.backend.shared.AbstractCrudService;
import com.example.backend.shared.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** CRUD de imagenes y validacion de la obra propietaria. */
@Service
public class ImagenObraService extends AbstractCrudService<ImagenObra> {
    private final ObraService obraService;
    private JdbcTemplate jdbcTemplate;

    public ImagenObraService(ObraService obraService) {
        this.obraService = obraService;
    }

    @Autowired(required = false)
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<ImagenObra> listar() {
        if (jdbcTemplate == null) return super.listar();
        return jdbcTemplate.query("""
                SELECT "id", "obraId", "urlImagen", "textoAlternativo",
                       "ordenVisualizacion", "esPrincipal", "creadoEn"
                FROM "imagenesObra" ORDER BY "obraId", "ordenVisualizacion"
                """, this::mapRow);
    }

        @Transactional
        public ImagenObra crear(ImagenObra solicitud) {
        obraService.buscar(solicitud.obraId(), "obra");
        UUID id = UUID.randomUUID();
        int ordenVisualizacion;

        if (jdbcTemplate == null) {
            List<ImagenObra> imagenesObra = listar().stream()
                .filter(imagen -> imagen.obraId().equals(solicitud.obraId()))
                .toList();
            if (solicitud.esPrincipal()) {
                boolean existeOrdenCero = imagenesObra.stream()
                    .anyMatch(imagen -> imagen.ordenVisualizacion() == 0);
                imagenesObra.forEach(imagen -> guardar(imagen.id(), new ImagenObra(imagen.id(),
                    imagen.obraId(), imagen.urlImagen(), imagen.textoAlternativo(),
                    imagen.ordenVisualizacion() + (existeOrdenCero ? 1 : 0), false, imagen.creadoEn())));
            ordenVisualizacion = 0;
            } else {
            ordenVisualizacion = imagenesObra.stream()
                .mapToInt(ImagenObra::ordenVisualizacion)
                .max()
                    .orElse(0) + 1;
            }
        } else {
            jdbcTemplate.queryForObject("SELECT \"id\" FROM \"obras\" WHERE \"id\" = ? FOR UPDATE",
                UUID.class, solicitud.obraId());
            int ordenMaximo = jdbcTemplate.queryForObject(
                "SELECT COALESCE(MAX(\"ordenVisualizacion\"), -1) FROM \"imagenesObra\" WHERE \"obraId\" = ?",
                Integer.class, solicitud.obraId());
            ordenVisualizacion = Math.max(0, ordenMaximo) + 1;
            if (solicitud.esPrincipal()) {
                boolean existeOrdenCero = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM \"imagenesObra\" WHERE \"obraId\" = ? AND \"ordenVisualizacion\" = 0)",
                        Boolean.class, solicitud.obraId());
                if (existeOrdenCero) {
                    int maximoParaDesplazar = ordenMaximo;
                    int desplazamiento = maximoParaDesplazar + 2;
                jdbcTemplate.update("UPDATE \"imagenesObra\" SET \"ordenVisualizacion\" = \"ordenVisualizacion\" + ? WHERE \"obraId\" = ?",
                    desplazamiento, solicitud.obraId());
                jdbcTemplate.update("UPDATE \"imagenesObra\" SET \"ordenVisualizacion\" = \"ordenVisualizacion\" - ? + 1 WHERE \"obraId\" = ?",
                    desplazamiento, solicitud.obraId());
            }
            jdbcTemplate.update("UPDATE \"imagenesObra\" SET \"esPrincipal\" = FALSE WHERE \"obraId\" = ?",
                solicitud.obraId());
            ordenVisualizacion = 0;
            }
        }

        ImagenObra creada = new ImagenObra(id, solicitud.obraId(), solicitud.urlImagen(),
            solicitud.textoAlternativo(), ordenVisualizacion, solicitud.esPrincipal(), OffsetDateTime.now());
        if (jdbcTemplate == null) return guardar(id, creada);
        jdbcTemplate.update("""
                INSERT INTO "imagenesObra" ("id", "obraId", "urlImagen", "textoAlternativo",
                    "ordenVisualizacion", "esPrincipal", "creadoEn")
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, creada.id(), creada.obraId(), creada.urlImagen(), creada.textoAlternativo(),
                creada.ordenVisualizacion(), creada.esPrincipal(), creada.creadoEn());
        return creada;
    }

    public ImagenObra actualizar(UUID id, ImagenObra solicitud) {
        ImagenObra actual = buscar(id, "imagen de obra");
        obraService.buscar(solicitud.obraId(), "obra");
        ImagenObra actualizada = new ImagenObra(id, solicitud.obraId(), solicitud.urlImagen(),
                solicitud.textoAlternativo(), solicitud.ordenVisualizacion(), solicitud.esPrincipal(),
                actual.creadoEn());
        if (jdbcTemplate == null) return guardar(id, actualizada);
        if (actualizada.esPrincipal()) {
            jdbcTemplate.update("UPDATE \"imagenesObra\" SET \"esPrincipal\" = FALSE WHERE \"obraId\" = ? AND \"id\" <> ?", actualizada.obraId(), id);
        }
        jdbcTemplate.update("""
                UPDATE "imagenesObra" SET "obraId" = ?, "urlImagen" = ?, "textoAlternativo" = ?,
                    "ordenVisualizacion" = ?, "esPrincipal" = ? WHERE "id" = ?
                """, actualizada.obraId(), actualizada.urlImagen(), actualizada.textoAlternativo(),
                actualizada.ordenVisualizacion(), actualizada.esPrincipal(), id);
        return actualizada;
    }

    @Override
    public void eliminar(UUID id, String resourceName) {
        if (jdbcTemplate == null) {
            super.eliminar(id, resourceName);
            return;
        }
        if (jdbcTemplate.update("DELETE FROM \"imagenesObra\" WHERE \"id\" = ?", id) == 0) {
            throw new ResourceNotFoundException(resourceName, id);
        }
    }

    private ImagenObra mapRow(ResultSet row, int rowNumber) throws SQLException {
        return new ImagenObra(row.getObject("id", UUID.class), row.getObject("obraId", UUID.class),
                row.getString("urlImagen"), row.getString("textoAlternativo"),
                row.getInt("ordenVisualizacion"), row.getBoolean("esPrincipal"),
                row.getObject("creadoEn", OffsetDateTime.class));
    }
}
