package com.belezaraiz.barbearia.model;

public enum StatusBarbeiro {
    ATIVO("Ativo"),
    FERIAS("De Férias"),
    INATIVO("Inativo");
    
    private final String descricao;
    
    StatusBarbeiro(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
}