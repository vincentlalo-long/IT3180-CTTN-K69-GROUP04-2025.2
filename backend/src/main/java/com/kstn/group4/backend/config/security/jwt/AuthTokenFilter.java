package com.kstn.group4.backend.config.security.jwt;

import com.kstn.group4.backend.config.security.services.UserDetailsServiceImplement;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    private final UserDetailsServiceImplement userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal( HttpServletRequest request,
                                    HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                System.out.println("[AuthTokenFilter] JWT found in request. Token length: " + jwt.length());
                
                if (jwtTokenProvider.isValidToken(jwt)) {
                    String email = jwtTokenProvider.extractUsernameFromToken(jwt);
                    System.out.println("[AuthTokenFilter] Token valid. Email from token: " + email);
                    
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    // Extract authorities from JWT token
                    String authoritiesFromToken = jwtTokenProvider.extractAuthoritiesFromToken(jwt);
                    System.out.println("[AuthTokenFilter] Raw authorities from token: '" + authoritiesFromToken + "'");
                    
                    List<GrantedAuthority> authorities = Arrays.stream(authoritiesFromToken.split(","))
                            .map(String::trim)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toCollection(java.util.ArrayList::new));

                    boolean hasAdmin = authorities.stream()
                            .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
                    if (hasAdmin) {
                        if (authorities.stream().noneMatch(a -> a.getAuthority().equals("ADMIN"))) {
                            authorities.add(new SimpleGrantedAuthority("ADMIN"));
                        }
                        if (authorities.stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        }
                    }

                    boolean hasPlayer = authorities.stream()
                            .anyMatch(a -> a.getAuthority().equals("PLAYER") || a.getAuthority().equals("ROLE_PLAYER"));
                    if (hasPlayer) {
                        if (authorities.stream().noneMatch(a -> a.getAuthority().equals("PLAYER"))) {
                            authorities.add(new SimpleGrantedAuthority("PLAYER"));
                        }
                        if (authorities.stream().noneMatch(a -> a.getAuthority().equals("ROLE_PLAYER"))) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_PLAYER"));
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    System.out.println("✅ [AuthTokenFilter] Authentication set successfully");
                    System.out.println("   - Email: " + email);
                    System.out.println("   - Authorities: " + authorities);
                    System.out.println("   - Has ADMIN: " + hasAdmin);
                } else {
                    System.out.println("❌ [AuthTokenFilter] Token validation failed");
                }
            } else {
                System.out.println("[AuthTokenFilter] No JWT token found in Authorization header");
            }
        } catch (Exception e) {
            logger.error("JWT authentication failed", e);
            System.out.println("❌ [AuthTokenFilter] Exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}

