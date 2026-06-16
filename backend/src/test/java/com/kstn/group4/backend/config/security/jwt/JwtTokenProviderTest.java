package com.kstn.group4.backend.config.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    private static final String TEST_SECRET_KEY = "myVeryLongSecretKeyForJwtTokenGenerationThatMustBeAtLeast512BitsForHS512Algorithm!!";
    private static final long TEST_EXPIRATION_MS = 3600_000L; // 1 hour
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_AUTHORITIES = "ROLE_USER,USER";

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() throws Exception {
        jwtTokenProvider = new JwtTokenProvider();
        setField("secretKey", TEST_SECRET_KEY);
        setField("tokenDurationInMillis", TEST_EXPIRATION_MS);
    }

    private void setField(String fieldName, Object value) throws Exception {
        Field field = JwtTokenProvider.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(jwtTokenProvider, value);
    }

    @SuppressWarnings("unchecked")
    private Authentication createMockAuthentication(String username, Collection<? extends GrantedAuthority> authorities) {
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn(username);
        when(userDetails.getAuthorities()).thenReturn((Collection) authorities);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        return authentication;
    }

    @SuppressWarnings("unchecked")
    private UserDetails createUserDetailsWithAuthorities(String username, String... roles) {
        UserDetails userDetails = mock(UserDetails.class);
        List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        when(userDetails.getUsername()).thenReturn(username);
        when(userDetails.getAuthorities()).thenReturn((Collection) authorities);
        return userDetails;
    }

    // ==================== generateToken ====================

    @Test
    @DisplayName("generateToken returns non-null and non-empty token")
    void generateToken_returnsNonNullToken() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(auth);

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("generateToken produces valid JWT structure (3 parts separated by dots)")
    void generateToken_producesValidJwtStructure() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(auth);

        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    @DisplayName("generateToken embeds authorities correctly")
    void generateToken_embedsAuthoritiesCorrectly() {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );
        Authentication auth = createMockAuthentication(TEST_USERNAME, authorities);

        String token = jwtTokenProvider.generateToken(auth);
        String extractedAuthorities = jwtTokenProvider.extractAuthoritiesFromToken(token);

        assertThat(extractedAuthorities).contains("ROLE_USER");
        assertThat(extractedAuthorityContains(extractedAuthorities, "ROLE_ADMIN")).isTrue();
    }

    private boolean extractedAuthorityContains(String authorities, String role) {
        for (String part : authorities.split(",")) {
            if (part.trim().equals(role)) return true;
        }
        return false;
    }

    // ==================== extractUsernameFromToken ====================

    @Test
    @DisplayName("extractUsernameFromToken returns correct username")
    void extractUsernameFromToken_returnsCorrectUsername() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(auth);
        String extractedUsername = jwtTokenProvider.extractUsernameFromToken(token);

        assertThat(extractedUsername).isEqualTo(TEST_USERNAME);
    }

    @Test
    @DisplayName("extractUsernameFromToken with different usernames returns respective username")
    void extractUsernameFromToken_withDifferentUsernames() {
        List<String> usernames = List.of("alice", "bob_admin", "user123@email.com");

        for (String username : usernames) {
            Authentication auth = createMockAuthentication(username,
                    List.of(new SimpleGrantedAuthority("ROLE_USER")));
            String token = jwtTokenProvider.generateToken(auth);

            assertThat(jwtTokenProvider.extractUsernameFromToken(token)).isEqualTo(username);
        }
    }

    // ==================== extractAuthoritiesFromToken ====================

    @Test
    @DisplayName("extractAuthoritiesFromToken returns correct authorities")
    void extractAuthoritiesFromToken_returnsCorrectAuthorities() {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_MANAGER")
        );
        Authentication auth = createMockAuthentication(TEST_USERNAME, authorities);

        String token = jwtTokenProvider.generateToken(auth);
        String extractedAuthorities = jwtTokenProvider.extractAuthoritiesFromToken(token);

        assertThat(extractedAuthorities).isNotNull();
        assertThat(extractedAuthorities).contains("ROLE_USER");
        assertThat(extractedAuthorityContains(extractedAuthorities, "ROLE_MANAGER")).isTrue();
    }

    @Test
    @DisplayName("extractAuthoritiesFromToken with single authority returns that authority")
    void extractAuthoritiesFromToken_singleAuthority() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        String token = jwtTokenProvider.generateToken(auth);
        String extractedAuthorities = jwtTokenProvider.extractAuthoritiesFromToken(token);

        assertThat(extractedAuthorities).isEqualTo("ROLE_ADMIN");
    }

    // ==================== isValidToken - valid tokens ====================

    @Test
    @DisplayName("isValidToken returns true for a validly generated token")
    void isValidToken_validToken_returnsTrue() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(auth);

        assertThat(jwtTokenProvider.isValidToken(token)).isTrue();
    }

    // ==================== isValidToken - expired token ====================

    @Test
    @DisplayName("isValidToken returns false for an expired token")
    void isValidToken_expiredToken_returnsFalse() throws Exception {
        setField("tokenDurationInMillis", -1L); // Set expiration in the past

        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtTokenProvider.generateToken(auth);

        // Wait briefly to ensure the token is already expired
        Thread.sleep(10);

        assertThat(jwtTokenProvider.isValidToken(token)).isFalse();
    }

    // ==================== isValidToken - malformed token ====================

    @Test
    @DisplayName("isValidToken returns false for a malformed token")
    void isValidToken_malformedToken_returnsFalse() {
        String malformedToken = "not.a.valid.jwt.token";

        assertThat(jwtTokenProvider.isValidToken(malformedToken)).isFalse();
    }

    @Test
    @DisplayName("isValidToken returns false for a random garbage string")
    void isValidToken_garbageString_returnsFalse() {
        assertThat(jwtTokenProvider.isValidToken("garbageValue123!@#$%^&*()")).isFalse();
    }

    @Test
    @DisplayName("isValidToken returns false for a token with only dots")
    void isValidToken_onlyDots_returnsFalse() {
        assertThat(jwtTokenProvider.isValidToken("..")).isFalse();
    }

    // ==================== isValidToken - null and empty tokens ====================

    @Test
    @DisplayName("isValidToken returns false for null token")
    void isValidToken_nullToken_returnsFalse() {
        assertThat(jwtTokenProvider.isValidToken(null)).isFalse();
    }

    @Test
    @DisplayName("isValidToken returns false for empty string")
    void isValidToken_emptyString_returnsFalse() {
        assertThat(jwtTokenProvider.isValidToken("")).isFalse();
    }

    @Test
    @DisplayName("isValidToken returns false for whitespace-only string")
    void isValidToken_whitespaceOnly_returnsFalse() {
        assertThat(jwtTokenProvider.isValidToken("   ")).isFalse();
    }

    // ==================== isValidToken - wrong signing key ====================

    @Test
    @DisplayName("isValidToken throws SignatureException when token was signed with a different key")
    void isValidToken_wrongSigningKey_throwsSignatureException() throws Exception {
        String otherSecretKey = "anotherCompletelyDifferentSecretKeyForTestingHS512AlgorithmThatIsLongEnough!!";

        JwtTokenProvider otherProvider = new JwtTokenProvider();
        setFieldOn(otherProvider, "secretKey", otherSecretKey);
        setFieldOn(otherProvider, "tokenDurationInMillis", TEST_EXPIRATION_MS);

        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = otherProvider.generateToken(auth);

        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () ->
                jwtTokenProvider.isValidToken(token));
    }

    private void setFieldOn(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // ==================== isValidToken - token truncated ====================

    @Test
    @DisplayName("isValidToken returns false for a truncated valid token")
    void isValidToken_truncatedToken_returnsFalse() {
        Authentication auth = createMockAuthentication(TEST_USERNAME,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtTokenProvider.generateToken(auth);
        String truncated = token.substring(0, token.length() / 2);

        assertThat(jwtTokenProvider.isValidToken(truncated)).isFalse();
    }

    // ==================== extractUsernameFromToken - invalid tokens ====================

    @Test
    @DisplayName("extractUsernameFromToken throws exception for invalid token")
    void extractUsernameFromToken_invalidToken_throwsException() {
        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () ->
                jwtTokenProvider.extractUsernameFromToken("invalid.token.here"));
    }

    @Test
    @DisplayName("extractAuthoritiesFromToken throws exception for invalid token")
    void extractAuthoritiesFromToken_invalidToken_throwsException() {
        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () ->
                jwtTokenProvider.extractAuthoritiesFromToken("invalid.token.here"));
    }

    // ==================== Round-trip consistency ====================

    @Test
    @DisplayName("Generate then extract username and authorities are consistent")
    void roundTrip_usernameAndAuthoritiesAreConsistent() {
        Authentication auth = createMockAuthentication("roundtrip_user",
                List.of(new SimpleGrantedAuthority("ROLE_MANAGER"),
                        new SimpleGrantedAuthority("ROLE_USER")));

        String token = jwtTokenProvider.generateToken(auth);

        assertThat(jwtTokenProvider.isValidToken(token)).isTrue();
        assertThat(jwtTokenProvider.extractUsernameFromToken(token)).isEqualTo("roundtrip_user");

        String authorities = jwtTokenProvider.extractAuthoritiesFromToken(token);
        assertThat(authorities).contains("ROLE_MANAGER");
        assertThat(authorityCount(authorities)).isEqualTo(2);
    }

    private long authorityCount(String commaSeparated) {
        if (commaSeparated == null || commaSeparated.isBlank()) return 0;
        return commaSeparated.split(",").length;
    }
}
