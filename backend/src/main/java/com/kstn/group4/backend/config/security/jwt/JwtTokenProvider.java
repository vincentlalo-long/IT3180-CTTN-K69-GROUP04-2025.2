package com.kstn.group4.backend.config.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private static final Logger loggerOfSecurityAndException = org.slf4j.LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long tokenDurationInMillis;

    private Key getSigningSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }


    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return Jwts.builder() // header.payload.signkey
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + tokenDurationInMillis))
                .signWith(getSigningSecretKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String extractUsernameFromToken(String tokenUpload) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningSecretKey())
                .build()
                .parseClaimsJws(tokenUpload)
                .getBody()
                .getSubject();
    }

    public boolean isValidToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningSecretKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            loggerOfSecurityAndException.error("Định dạng token không hợp lệ ! : {}", e.getMessage());

        } catch (ExpiredJwtException e) {
            loggerOfSecurityAndException.error("Token đã hết hạn ! : {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            loggerOfSecurityAndException.error("Token không được hỗ trợ ! : {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            loggerOfSecurityAndException.error("Chuỗi token rỗng hoặc null ! : {}", e.getMessage());
        }
        return false;

    }

}