package com.belezaraiz.barbearia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Endpoints públicos para teste
                .requestMatchers("/api/test/**").permitAll()
                
                // Endpoints de autenticação públicos
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/gerar-hash").permitAll()
                
                // Endpoints de autenticação protegidos
                .requestMatchers("/api/auth/create-barber").authenticated()
                .requestMatchers("/api/auth/me").authenticated()
                
                // Público: clientes podem ver barbeiros ativos para agendar
                .requestMatchers("/api/barbeiros/ativos").permitAll()
                
                // Protegido: gerente gerencia barbeiros (listar todos, mudar status)
                .requestMatchers("/api/barbeiros/**").authenticated()
                // ==================================================
                
                // Console H2 (se estiver usando)
                .requestMatchers("/h2-console/**").permitAll()
                
                // Outros endpoints requerem autenticação
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        http.headers(headers -> headers.frameOptions().disable());
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitir origens específicas
        configuration.addAllowedOriginPattern("*");
        
        // Permitir todos os métodos HTTP
        configuration.addAllowedMethod("*");
        
        // Permitir todos os headers
        configuration.addAllowedHeader("*");
        
        // Permitir credentials (cookies, tokens)
        configuration.setAllowCredentials(true);
        
        // Configurar para todos os paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}