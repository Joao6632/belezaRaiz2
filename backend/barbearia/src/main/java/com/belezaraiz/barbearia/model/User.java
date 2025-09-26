package com.belezaraiz.barbearia.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;
    
    @NotBlank(message = "Login é obrigatório")
    @Size(max = 160, message = "Login deve ter no máximo 160 caracteres")
    @Column(name = "login", nullable = false, length = 160)
    private String login;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(max = 255, message = "Senha deve ter no máximo 255 caracteres")
    @Column(name = "senha", nullable = false, length = 255)
    private String senha;
    
    @Size(max = 21, message = "Tipo deve ter no máximo 21 caracteres")
    @Column(name = "tipo", nullable = false, length = 21)
    private String tipo = "cliente";
    
    public User(String nome, String login, String senha, String tipo) {
        this.nome = nome;
        this.login = login;
        this.senha = senha;
        this.tipo = tipo != null ? tipo : "cliente";
    }
    
    // Métodos auxiliares
    public boolean isEmailLogin() {
        return login != null && login.contains("@");
    }
    
    public boolean isPhoneLogin() {
        return login != null && login.matches("\\d{10,11}");
    }
}