package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PruebaController {

    @GetMapping("/api/prueba")
    public String prueba() {
        return "Backend de Academia Atelier funcionando";
    }
}