package com.recrutement.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    // In real projects: move to application.properties (and don’t commit it)
    private static final String SECRET_KEY =
            "3f7a2b8e4d9c6f1a5b8d3e7f9c2a6b4d8e1f5a9c3d7e2f6a9b4c8d1e5f9a2b7c";

    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 10; // 10 hours

    public String generateToken(String email) {
        return createToken(new HashMap<>(), email);
    }

    private String createToken(Map<String, Object> claims, String subjectEmail) {
        Date now = new Date(System.currentTimeMillis());
        Date expiry = new Date(System.currentTimeMillis() + EXPIRATION_MS);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subjectEmail)      // email stored in "sub"
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        // Important to use a stable charset
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractEmail(String token) throws JwtException, ExpiredJwtException {
        return extractAllClaims(token).getSubject();
    }

    private Claims extractAllClaims(String token) throws JwtException, ExpiredJwtException {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return extractedEmail.equals(email) && !isTokenExpired(token);
    }
}