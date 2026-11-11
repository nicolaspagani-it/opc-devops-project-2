package com.openclassrooms.etudiant.service;

import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// Installation des dépendances JJWT dans pom.xml et configuration du jwt Token

@Service
public class JwtService {

    private static final String SECRET_KEY = "wwWYLudqEDTxEeeOFIxwq/nztBKYO4KCMsqGvvqjUvE=";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET_KEY));
    }

    public String generateToken(UserDetails userDetails) {

        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(now))
                .expiration(new Date(now + 3600000))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Vérifie la signature et l'expiration du token puis renvoie le login (subject).
     *
     * @throws io.jsonwebtoken.JwtException si le token est invalide ou expiré
     */
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
