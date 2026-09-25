package com.example.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PruebaController {

    private final JdbcTemplate jdbcTemplate;

    public PruebaController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/test-db")
    public String testDatabaseConnection() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        return "Conexion exitosa. PostgreSQL respondio: " + result;
    }
}