package com.kstn.group4.backend.service;

import com.kstn.group4.backend.dto.booking.BookingResponse;
import com.kstn.group4.backend.dto.booking.CreateBookingRequest;
import com.kstn.group4.backend.entity.Booking;
import com.kstn.group4.backend.entity.Pitch;
import com.kstn.group4.backend.entity.Role;
import com.kstn.group4.backend.entity.User;
import com.kstn.group4.backend.exception.BadRequestException;
import com.kstn.group4.backend.exception.ConflictException;
import com.kstn.group4.backend.exception.ForbiddenOperationException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import com.kstn.group4.backend.repository.BookingRepository;
import com.kstn.group4.backend.repository.PitchRepository;
import com.kstn.group4.backend.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Set<String> ACTIVE_BOOKING_STATUSES = Set.of("pending", "approved");
    private static final Set<String> ALLOWED_OWNER_STATUSES = Set.of("approved", "rejected", "canceled");

    private final BookingRepository bookingRepository;
    private final PitchRepository pitchRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(Integer playerId, CreateBookingRequest request) {
        validateCreateBookingRequest(request);

        User player = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy player với id: " + playerId));

        if (Role.fromValue(player.getRole()) != Role.PLAYER) {
            throw new ForbiddenOperationException("Chỉ player mới được tạo đặt sân");
        }

        Pitch pitch = pitchRepository.findByIdForUpdate(request.pitchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân với id: " + request.pitchId()));

        List<Booking> overlaps = bookingRepository.findOverlappingBookingsForUpdate(
                request.pitchId(),
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                ACTIVE_BOOKING_STATUSES
        );

        if (!overlaps.isEmpty()) {
            throw new ConflictException("Khung giờ đã được đặt, vui lòng chọn thời gian khác");
        }

        Booking booking = new Booking();
        booking.setPlayer(player);
        booking.setPitch(pitch);
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus("pending");
        booking.setBookingType(request.bookingType() == null || request.bookingType().isBlank()
                ? "one-time"
                : request.bookingType());
        booking.setTotalPrice(request.totalPrice());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Integer playerId) {
        return bookingRepository.findByPlayerIdOrderByCreatedAtDesc(playerId)
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getManagerBookings(Integer ownerId) {
        return bookingRepository.findAllByManagerId(ownerId)
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Integer ownerId, Integer bookingId, String status) {
        String normalizedStatus = status == null ? "" : status.trim().toLowerCase();
        if (!ALLOWED_OWNER_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Trạng thái không hợp lệ. Chỉ chấp nhận: approved, rejected, canceled");
        }

        Booking booking = bookingRepository.findByIdWithPitchAndManager(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking với id: " + bookingId));

        Integer bookingOwnerId = booking.getPitch().getManager().getId();
        if (!ownerId.equals(bookingOwnerId)) {
            throw new ForbiddenOperationException("Bạn không có quyền cập nhật booking này");
        }

        booking.setStatus(normalizedStatus);
        Booking updated = bookingRepository.save(booking);
        return toBookingResponse(updated);
    }

    private void validateCreateBookingRequest(CreateBookingRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("start_time phải nhỏ hơn end_time");
        }

        if (request.bookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Không thể đặt sân cho ngày trong quá khứ");
        }
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .pitchId(booking.getPitch().getId())
                .pitchName(booking.getPitch().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .bookingType(booking.getBookingType())
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
