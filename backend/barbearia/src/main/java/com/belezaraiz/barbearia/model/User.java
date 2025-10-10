package com.belezaraiz.barbearia.model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
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
    
    // ========== CAMPOS PARA BARBEIROS ==========
    
    // CORRIGIDO: @Lob para suportar imagens Base64 grandes
    @Lob
    @Column(name = "foto_perfil", columnDefinition = "LONGTEXT")
    private String fotoPerfil;
    
    @Column(name = "horario_inicio")
    private LocalTime horarioInicio;
    
    @Column(name = "horario_fim")
    private LocalTime horarioFim;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private StatusBarbeiro status;
    
    // =================================================
    
    public User(String nome, String login, String senha, String tipo) {
        this.nome = nome;
        this.login = login;
        this.senha = senha;
        this.tipo = tipo != null ? tipo : "cliente";
        // Status é setado apenas para barbeiros
    }
    
    // Métodos auxiliares
    public boolean isEmailLogin() {
        return login != null && login.contains("@");
    }
    
    public boolean isPhoneLogin() {
        return login != null && login.matches("\\d{10,11}");
    }
    
    public boolean isBarbeiro() {
        return "barbeiro".equalsIgnoreCase(tipo);
    }
    
    public boolean isAtivo() {
        return StatusBarbeiro.ATIVO.equals(status);
    }
    
    public boolean isDeFerias() {
        return StatusBarbeiro.FERIAS.equals(status);
    }
    
    public boolean isInativo() {
        return StatusBarbeiro.INATIVO.equals(status);
    }

    public void setAtivo(boolean b) {
        this.status = b ? StatusBarbeiro.ATIVO : StatusBarbeiro.INATIVO;
    }
}