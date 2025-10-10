package com.belezaraiz.barbearia.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.belezaraiz.barbearia.dto.BarbeiroResponse;
import com.belezaraiz.barbearia.dto.UpdateBarbeiroStatusRequest;
import com.belezaraiz.barbearia.model.StatusBarbeiro;
import com.belezaraiz.barbearia.model.User;
import com.belezaraiz.barbearia.repository.UserRepository;
import com.belezaraiz.barbearia.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BarbeiroService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    // Listar todos os barbeiros
    public List<BarbeiroResponse> listarBarbeiros() {
        return userRepository.findAll().stream()
                .filter(user -> "barbeiro".equalsIgnoreCase(user.getTipo()))
                .map(this::toBarbeiroResponse)
                .collect(Collectors.toList());
    }
    
    // Listar apenas barbeiros ativos (para agendamento)
    public List<BarbeiroResponse> listarBarbeirosAtivos() {
        return userRepository.findAll().stream()
                .filter(user -> "barbeiro".equalsIgnoreCase(user.getTipo()))
                .filter(User::isAtivo)
                .map(this::toBarbeiroResponse)
                .collect(Collectors.toList());
    }
    
    // Atualizar status do barbeiro (GERENTE apenas)
    public BarbeiroResponse atualizarStatus(Long barbeiroId, 
                                           UpdateBarbeiroStatusRequest request, 
                                           String managerToken) {
        // Validar se é gerente
        String managerTipo = jwtUtil.extractTipo(managerToken);
        if (!"gerente".equals(managerTipo)) {
            throw new RuntimeException("Apenas gerentes podem alterar status de barbeiros");
        }
        
        // Buscar barbeiro
        User barbeiro = userRepository.findById(barbeiroId)
                .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado"));
        
        if (!"barbeiro".equalsIgnoreCase(barbeiro.getTipo())) {
            throw new RuntimeException("Usuário não é um barbeiro");
        }
        
        // Atualizar status
        StatusBarbeiro statusAntigo = barbeiro.getStatus();
        barbeiro.setStatus(request.getStatus());
        barbeiro = userRepository.save(barbeiro);
        
        log.info("Status do barbeiro {} alterado de {} para {} pelo gerente", 
                 barbeiro.getNome(), statusAntigo, barbeiro.getStatus());
        
        return toBarbeiroResponse(barbeiro);
    }
    
    // Deletar barbeiro (GERENTE apenas)
    public void deletarBarbeiro(Long barbeiroId, String managerToken) {
        log.info("Tentando deletar barbeiro ID: {}", barbeiroId);
        
        // Validar se é gerente
        String managerTipo = jwtUtil.extractTipo(managerToken);
        if (!"gerente".equals(managerTipo)) {
            log.warn("Tentativa de deletar barbeiro sem ser gerente");
            throw new RuntimeException("Apenas gerentes podem deletar barbeiros");
        }
        
        // Buscar barbeiro
        User barbeiro = userRepository.findById(barbeiroId)
                .orElseThrow(() -> new RuntimeException("Barbeiro não encontrado"));
        
        if (!"barbeiro".equalsIgnoreCase(barbeiro.getTipo())) {
            throw new RuntimeException("Usuário não é um barbeiro");
        }
        
        // Deletar
        userRepository.delete(barbeiro);
        log.info("Barbeiro {} (ID: {}) deletado com sucesso pelo gerente", 
                 barbeiro.getNome(), barbeiroId);
    }
    
    // Converter User para BarbeiroResponse
    private BarbeiroResponse toBarbeiroResponse(User user) {
        return new BarbeiroResponse(
            user.getId(),
            user.getNome(),
            user.getLogin(),
            user.getFotoPerfil(),
            user.getHorarioInicio(),
            user.getHorarioFim(),
            user.getStatus()
        );
    }
}