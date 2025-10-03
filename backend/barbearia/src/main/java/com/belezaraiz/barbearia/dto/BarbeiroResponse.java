package com.belezaraiz.barbearia.dto;

import java.time.LocalTime;

import com.belezaraiz.barbearia.model.StatusBarbeiro;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BarbeiroResponse {
    private Long id;
    private String nome;
    private String login;
    private String fotoPerfil;
    private LocalTime horarioInicio;
    private LocalTime horarioFim;
    private StatusBarbeiro status;
}