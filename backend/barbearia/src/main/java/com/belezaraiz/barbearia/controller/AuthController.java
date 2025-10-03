package com.belezaraiz.barbearia.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.belezaraiz.barbearia.dto.AuthResponse;
import com.belezaraiz.barbearia.dto.CreateBarberRequest;
import com.belezaraiz.barbearia.dto.ErrorResponse;
import com.belezaraiz.barbearia.dto.LoginRequest;
import com.belezaraiz.barbearia.dto.RegisterRequest;
import com.belezaraiz.barbearia.dto.UserResponse;
import com.belezaraiz.barbearia.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro no registro: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro no login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/create-barber")
    public ResponseEntity<?> createBarber(
            @Valid @RequestBody CreateBarberRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            AuthResponse response = authService.createBarber(request, token);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao criar barbeiro: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var user = authService.getCurrentUser(token);
            return ResponseEntity.ok(new UserResponse(user.getId(), user.getNome(), 
                                                    user.getLogin(), user.getTipo()));
        } catch (Exception e) {
            log.error("Erro ao buscar usuário atual: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Endpoint temporário para gerar hash de senhas
     * ⚠️ REMOVER EM PRODUÇÃO!
     */
    @PostMapping("/gerar-hash")
    public ResponseEntity<Map<String, String>> gerarHash(@RequestParam String senha) {
        try {
            String hash = passwordEncoder.encode(senha);
            
            Map<String, String> response = new HashMap<>();
            response.put("senha_original", senha);
            response.put("hash", hash);
            
            log.info("Hash gerado para desenvolvimento");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao gerar hash: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}