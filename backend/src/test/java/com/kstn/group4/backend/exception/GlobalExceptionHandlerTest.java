package com.kstn.group4.backend.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    private WebRequest createMockWebRequest() {
        WebRequest request = mock(WebRequest.class);
        when(request.getDescription(false)).thenReturn("uri=/api/v1/test");
        return request;
    }

    // ===== ResourceNotFoundException -> 404 =====

    @Test
    void handleResourceNotFoundException_returns404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Không tìm thấy Venue với ID: 99");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleResourceNotFoundException(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("Resource", response.getBody().get("error"));
        assertEquals("Không tìm thấy Venue với ID: 99", response.getBody().get("message"));
    }

    @Test
    void handleResourceNotFoundException_withResourceName_usesResourceName() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found", "Venue");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleResourceNotFoundException(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Venue", response.getBody().get("error"));
    }

    // ===== ResourceConflictException -> 409 =====

    @Test
    void handleResourceConflictException_returns409() {
        ResourceConflictException ex = new ResourceConflictException("Username đã tồn tại");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleResourceConflictException(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().get("status"));
        assertEquals("CONFLICT", response.getBody().get("error"));
        assertEquals("Username đã tồn tại", response.getBody().get("message"));
    }

    // ===== BusinessException -> 400 =====

    @Test
    void handleBusinessException_returns400WithErrorCode() {
        BusinessException ex = new BusinessException("Token không hợp lệ", "INVALID_TOKEN");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleBusinessException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("INVALID_TOKEN", response.getBody().get("error"));
        assertEquals("Token không hợp lệ", response.getBody().get("message"));
    }

    @Test
    void handleBusinessException_withDefaultErrorCode() {
        BusinessException ex = new BusinessException("Something went wrong");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleBusinessException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("BUSINESS_ERROR", response.getBody().get("error"));
    }

    // ===== ForbiddenException -> 403 =====

    @Test
    void handleForbiddenException_returns403() {
        ForbiddenException ex = new ForbiddenException("Truy cập bị từ chối");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleForbiddenException(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().get("status"));
        assertEquals("FORBIDDEN", response.getBody().get("error"));
        assertEquals("Truy cập bị từ chối", response.getBody().get("message"));
    }

    // ===== MethodArgumentNotValidException -> 400 =====

    @Test
    void handleMethodArgumentNotValid_returns400WithFieldErrors() throws NoSuchMethodException {
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("handleMethodArgumentNotValid_returns400WithFieldErrors"), -1);

        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError1 = new FieldError("registerRequest", "username", "Username không được để trống");
        FieldError fieldError2 = new FieldError("registerRequest", "email", "Email không hợp lệ");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleMethodArgumentNotValid(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("VALIDATION_ERROR", response.getBody().get("error"));

        @SuppressWarnings("unchecked")
        Map<String, String> fields = (Map<String, String>) response.getBody().get("fields");
        assertNotNull(fields);
        assertEquals(2, fields.size());
        assertEquals("Username không được để trống", fields.get("username"));
        assertEquals("Email không hợp lệ", fields.get("email"));
    }

    @Test
    void handleMethodArgumentNotValid_withEmptyFieldErrors_returns400() throws NoSuchMethodException {
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("handleMethodArgumentNotValid_withEmptyFieldErrors_returns400"), -1);

        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleMethodArgumentNotValid(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("VALIDATION_ERROR", response.getBody().get("error"));

        @SuppressWarnings("unchecked")
        Map<String, String> fields = (Map<String, String>) response.getBody().get("fields");
        assertNotNull(fields);
        assertTrue(fields.isEmpty());
    }

    // ===== RuntimeException -> 500 =====

    @Test
    void handleRuntimeException_returns500() {
        RuntimeException ex = new RuntimeException("Unexpected failure");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleRuntimeException(ex, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("INTERNAL_ERROR", response.getBody().get("error"));
        assertTrue(response.getBody().get("message").toString().contains("Unexpected failure"));
    }

    // ===== Timestamp and path are always present =====

    @Test
    void allErrorResponses_containTimestampAndPath() {
        ResourceNotFoundException ex = new ResourceNotFoundException("test");
        WebRequest request = createMockWebRequest();

        ResponseEntity<Map<String, Object>> response =
                exceptionHandler.handleResourceNotFoundException(ex, request);

        assertNotNull(response.getBody().get("timestamp"));
        assertEquals("uri=/api/v1/test", response.getBody().get("path"));
    }
}
