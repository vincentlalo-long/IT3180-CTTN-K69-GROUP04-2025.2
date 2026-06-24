package com.kstn.group4.backend.booking.repository;

import com.kstn.group4.backend.booking.entity.BookingServiceItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingServiceItemRepository extends JpaRepository<BookingServiceItem, Integer> {
    List<BookingServiceItem> findByBookingId(Integer bookingId);
}
