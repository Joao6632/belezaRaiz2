package com.belezaraiz.barbearia.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Login é obrigatório (email ou telefone)")
    private String login;
    
    @NotBlank(message = "Senha é obrigatória")
    private String senha;
}