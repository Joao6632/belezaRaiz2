package com.belezaraiz.barbearia.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String nome;
    private String login;
    private String tipo;
    private String loginType;
    
    public AuthResponse(String token, Long id, String nome, String login, String tipo) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.login = login;
        this.tipo = tipo;
        this.loginType = determineLoginType(login);
    }
    
    private String determineLoginType(String login) {
        if (login.contains("@")) {
            return "email";
        } else if (login.matches("\\d{10,11}")) {
            return "phone";
        }
        return "unknown";
    }
}