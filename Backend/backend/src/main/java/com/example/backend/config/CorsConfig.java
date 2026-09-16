package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite que el panel-pruebas.html se ejecute desde file:// o desde un
 * servidor local separado durante las pruebas manuales.
 *
 * Esta politica es deliberadamente amplia solo para desarrollo local. Antes
 * de desplegar, debe reemplazarse por los dominios reales del frontend.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
