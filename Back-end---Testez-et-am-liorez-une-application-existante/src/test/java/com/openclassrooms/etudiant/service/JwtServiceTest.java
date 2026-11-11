package com.openclassrooms.etudiant.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
public class JwtServiceTest {
    private static final String LOGIN = "npagani";
    private static final String PASSWORD = "azerty123";
    
    @InjectMocks
    private JwtService jwtService;

    @Test
    public void test_generate_token_and_extract_username() {
        // GIVEN : un utilisateur (classe User de Spring Security, qui implémente UserDetails)
        UserDetails userDetails = User.builder()
                .username(LOGIN)
                .password(PASSWORD)
                .build();

        // WHEN : on génère un token puis on relit le login qu'il contient
        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);

        // THEN : un JWT a 3 parties séparées par des points (en-tête.contenu.signature)
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
        // Le login retrouvé dans le token est celui de l'utilisateur
        assertThat(username).isEqualTo(LOGIN);

        // Preuve affichée dans le terminal
        System.out.println("===== PREUVE test_generate_token_and_extract_username =====");
        System.out.println("Utilisateur                   : " + LOGIN);
        System.out.println("Token généré                  : " + token);
        System.out.println("Nombre de parties du token    : " + token.split("\\.").length);
        System.out.println("Login extrait du token        : " + username);
        System.out.println("===== TEST REUSSI =====");
    }
}
