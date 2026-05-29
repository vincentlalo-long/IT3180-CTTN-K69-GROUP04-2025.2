package com.kstn.group4.backend.venue.service.admin;

import com.kstn.group4.backend.exception.BusinessException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads/venues";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    /**
     * Lưu file ảnh vào thư mục uploads/venues/ và trả về relative URL path.
     *
     * @param file MultipartFile từ request
     * @return đường dẫn tương đối, ví dụ: /uploads/venues/abc123.jpg
     */
    public String storeVenueImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File ảnh không được để trống.", "EMPTY_FILE");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File ảnh vượt quá giới hạn 10MB.", "FILE_TOO_LARGE");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(
                    "Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, WEBP, GIF.",
                    "INVALID_FILE_TYPE"
            );
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String storedFilename = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            Path targetPath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/" + UPLOAD_DIR + "/" + storedFilename;
        } catch (IOException e) {
            throw new BusinessException("Lỗi khi lưu file ảnh: " + e.getMessage(), "FILE_STORAGE_ERROR");
        }
    }
}
