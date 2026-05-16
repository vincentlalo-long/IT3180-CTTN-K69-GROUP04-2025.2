package com.kstn.group4.backend.config.security.services;

import com.kstn.group4.backend.user.entity.User;
import com.kstn.group4.backend.user.entity.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;


public class UserPrincipal implements UserDetails {
    private Integer id;
    private String principal;
    private String username;
    private String email;
    private String role;

    @JsonIgnore
    private final String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Integer id, String principal, String username, String email, String password,
                           String role, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.principal = principal;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.authorities = authorities;
    }

    public static UserPrincipal build(User user) {
        String normalizedRole = Role.fromValue(user.getRole()).name();
        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(normalizedRole)
        );
        
        System.out.println("[UserPrincipal.build] User: " + user.getEmail() + ", Role: " + normalizedRole + ", Authorities: " + authorities);

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                normalizedRole,
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    public Integer getId() { return id; }

    public String getEmail() { return email; }

    public String getRole() { return role; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return principal; }

    public String getAppUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}

