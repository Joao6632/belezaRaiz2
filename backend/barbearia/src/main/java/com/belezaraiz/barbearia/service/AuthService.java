package com.belezaraiz.barbearia.service;

import java.time.LocalTime;
import java.util.regex.Pattern;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.belezaraiz.barbearia.dto.AuthResponse;
import com.belezaraiz.barbearia.dto.CreateBarberRequest;
import com.belezaraiz.barbearia.dto.LoginRequest;
import com.belezaraiz.barbearia.dto.RegisterRequest;
import com.belezaraiz.barbearia.model.StatusBarbeiro;
import com.belezaraiz.barbearia.model.User;
import com.belezaraiz.barbearia.repository.UserRepository;
import com.belezaraiz.barbearia.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^\\d{10,11}$");
    
    public AuthResponse register(RegisterRequest request) {
        log.info("Tentativa de registro para login: {}", request.getLogin());
        
        if (!isValidLogin(request.getLogin())) {
            throw new RuntimeException("Login deve ser um email válido ou telefone (10-11 dígitos)");
        }
        
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("Login já está em uso");
        }
        
        User user = new User();
        user.setNome(request.getNome());
        user.setLogin(request.getLogin());
        user.setSenha(passwordEncoder.encode(request.getSenha()));
        
        String tipo = request.getTipo();
        if (tipo == null || tipo.isBlank()) {
            tipo = "cliente";
        }
        user.setTipo(tipo.toLowerCase());
        
        user = userRepository.save(user);
        log.info("Usuário registrado com sucesso. ID: {}, Tipo: {}", user.getId(), user.getTipo());
        
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getNome(), 
                              user.getLogin(), user.getTipo());
    }
    
    public AuthResponse login(LoginRequest request) {
        log.info("Tentativa de login para: {}", request.getLogin());
        
        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));
        
        if (!passwordEncoder.matches(request.getSenha(), user.getSenha())) {
            log.warn("Senha incorreta para login: {}", request.getLogin());
            throw new RuntimeException("Credenciais inválidas");
        }
        
        log.info("Login realizado com sucesso para: {} ({})", user.getNome(), user.getTipo());
        
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getNome(), 
                              user.getLogin(), user.getTipo());
    }
    
    public AuthResponse createBarber(CreateBarberRequest request, String managerToken) {
        String managerTipo = jwtUtil.extractTipo(managerToken);
        if (!"gerente".equals(managerTipo)) {
            throw new RuntimeException("Apenas gerentes podem criar barbeiros");
        }
        
        if (!isValidLogin(request.getLogin())) {
            throw new RuntimeException("Login deve ser um email válido ou telefone (10-11 dígitos)");
        }
        
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("Login já está em uso");
        }
        
        // Validar e converter horários
        LocalTime inicio = null;
        LocalTime fim = null;
        
        if (request.getHorarioInicio() != null && !request.getHorarioInicio().isBlank() &&
            request.getHorarioFim() != null && !request.getHorarioFim().isBlank()) {
            try {
                inicio = LocalTime.parse(request.getHorarioInicio());
                fim = LocalTime.parse(request.getHorarioFim());
                
                if (fim.isBefore(inicio) || fim.equals(inicio)) {
                    throw new RuntimeException("Horário de fim deve ser maior que o horário de início");
                }
            } catch (java.time.format.DateTimeParseException e) {
                throw new RuntimeException("Formato de horário inválido. Use HH:mm (ex: 08:00)");
            }
        }
        
        User barbeiro = new User();
        barbeiro.setNome(request.getNome());
        barbeiro.setLogin(request.getLogin());
        barbeiro.setSenha(passwordEncoder.encode(request.getSenha()));
        barbeiro.setTipo("barbeiro");
        
        // Campos específicos do barbeiro
        barbeiro.setFotoPerfil(request.getFotoPerfil());
        barbeiro.setHorarioInicio(inicio);
        barbeiro.setHorarioFim(fim);
        barbeiro.setStatus(StatusBarbeiro.ATIVO);
        
        barbeiro = userRepository.save(barbeiro);
        log.info("Barbeiro criado com sucesso. ID: {}, Nome: {}, Horário: {} às {}", 
                 barbeiro.getId(), barbeiro.getNome(), 
                 barbeiro.getHorarioInicio(), barbeiro.getHorarioFim());
        
        String token = jwtUtil.generateToken(barbeiro);
        return new AuthResponse(token, barbeiro.getId(), barbeiro.getNome(), 
                              barbeiro.getLogin(), barbeiro.getTipo());
    }
    
    public User getCurrentUser(String token) {
        String login = jwtUtil.extractLogin(token);
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
    
    private boolean isValidLogin(String login) {
        return EMAIL_PATTERN.matcher(login).matches() || 
               PHONE_PATTERN.matcher(login).matches();
    }
}