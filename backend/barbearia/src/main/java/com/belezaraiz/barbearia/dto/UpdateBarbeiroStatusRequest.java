package com.belezaraiz.barbearia.dto;

import com.belezaraiz.barbearia.model.StatusBarbeiro;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBarbeiroStatusRequest {
    
    @NotNull(message = "Status é obrigatório")
    private StatusBarbeiro status;
}