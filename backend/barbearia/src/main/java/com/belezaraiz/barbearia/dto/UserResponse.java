package com.belezaraiz.barbearia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nome;
    private String login;
    private String tipo;
}