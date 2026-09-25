package com.example.backend.config;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/** Conexion JDBC opcional para las tablas PostgreSQL de Supabase. */
@Configuration
@ConditionalOnProperty(name = "supabase.db.enabled", havingValue = "true")
public class SupabaseDatabaseConfig {
    @Value("${supabase.db.url}")
    private String databaseUrl;

    @Value("${supabase.db.username:postgres}")
    private String databaseUsername;

    @Value("${supabase.db.password}")
    private String databasePassword;

    @Bean
    DataSource supabaseDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(databaseUrl);
        dataSource.setUsername(databaseUsername);
        dataSource.setPassword(databasePassword);
        return dataSource;
    }

    @Bean
    JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}