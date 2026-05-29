package com.kstn.group4.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application.
 * Centralized handling of all custom exceptions with standardized response format.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle ResourceNotFoundException - 404 Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                ex.getResourceName(),
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle ResourceConflictException - 409 Conflict
     */
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<Map<String, Object>> handleResourceConflictException(
            ResourceConflictException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                "CONFLICT",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handle MethodArgumentTypeMismatchException - 400 Bad Request
     * Occurs when request parameters don't match expected type (e.g., invalid date format)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            WebRequest request
    ) {
        String message = String.format(
                "Giá trị '%s' của tham số '%s' không hợp lệ. Dự kiến kiểu %s.",
                ex.getValue(),
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"
        );
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                "INVALID_PARAMETER",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle DateTimeParseException - 400 Bad Request
     * Occurs when date/time parsing fails
     */
    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<Map<String, Object>> handleDateTimeParseException(
            DateTimeParseException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Định dạng ngày tháng không hợp lệ. Vui lòng sử dụng định dạng: yyyy-MM-dd",
                "INVALID_DATE_FORMAT",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle BusinessException - 400 Bad Request
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(
            BusinessException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                ex.getErrorCode(),
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle ForbiddenException - 403 Forbidden
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenException(
            ForbiddenException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                "FORBIDDEN",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handle UsernameNotFoundException - 401 Unauthorized
     * Occurs when user is not found during authentication
     */
    @ExceptionHandler(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(
            org.springframework.security.core.userdetails.UsernameNotFoundException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Thông tin xác thực không hợp lệ",
                "UNAUTHORIZED",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handle generic RuntimeException - 500 Internal Server Error
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred: " + ex.getMessage(),
                "INTERNAL_ERROR",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handle generic Exception - 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception ex,
            WebRequest request
    ) {
        Map<String, Object> response = buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An error occurred: " + ex.getMessage(),
                "ERROR",
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Build standardized error response format
     */
    private Map<String, Object> buildErrorResponse(
            int status,
            String message,
            String errorCode,
            String path
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status);
        response.put("error", errorCode);
        response.put("message", message);
        response.put("path", path);
        return response;
    }
}
