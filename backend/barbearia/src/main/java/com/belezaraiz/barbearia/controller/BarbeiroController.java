package com.belezaraiz.barbearia.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.belezaraiz.barbearia.dto.BarbeiroResponse;
import com.belezaraiz.barbearia.dto.ErrorResponse;
import com.belezaraiz.barbearia.dto.UpdateBarbeiroStatusRequest;
import com.belezaraiz.barbearia.service.BarbeiroService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/barbeiros")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class BarbeiroController {
    
    private final BarbeiroService barbeiroService;
    
    // Listar todos os barbeiros (para o gerente)
    @GetMapping
    public ResponseEntity<?> listarTodos(@RequestHeader("Authorization") String authHeader) {
        try {
            List<BarbeiroResponse> barbeiros = barbeiroService.listarBarbeiros();
            return ResponseEntity.ok(barbeiros);
        } catch (Exception e) {
            log.error("Erro ao listar barbeiros: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Listar apenas barbeiros ativos (para clientes fazerem agendamento)
    @GetMapping("/ativos")
    public ResponseEntity<?> listarAtivos() {
        try {
            List<BarbeiroResponse> barbeiros = barbeiroService.listarBarbeirosAtivos();
            return ResponseEntity.ok(barbeiros);
        } catch (Exception e) {
            log.error("Erro ao listar barbeiros ativos: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Atualizar status do barbeiro (GERENTE apenas)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBarbeiroStatusRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            BarbeiroResponse barbeiro = barbeiroService.atualizarStatus(id, request, token);
            return ResponseEntity.ok(barbeiro);
        } catch (Exception e) {
            log.error("Erro ao atualizar status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Deletar barbeiro (GERENTE apenas)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarBarbeiro(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            barbeiroService.deletarBarbeiro(id, token);
            log.info("Barbeiro ID {} deletado com sucesso", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao deletar barbeiro ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}