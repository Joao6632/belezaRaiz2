package com.belezaraiz.barbearia;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BarbeariaApplication {
    public static void main(String[] args) {
        SpringApplication.run(BarbeariaApplication.class, args);
    }

    @Bean
CommandLineRunner runner() {
    return args -> {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Hash de 123456 => " + encoder.encode("123456"));
    };
}

}