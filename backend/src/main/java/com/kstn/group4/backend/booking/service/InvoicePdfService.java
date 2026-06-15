package com.kstn.group4.backend.booking.service;

import com.kstn.group4.backend.booking.entity.Booking;
import com.kstn.group4.backend.booking.entity.BookingPayment;
import com.kstn.group4.backend.booking.repository.BookingRepository;
import com.kstn.group4.backend.booking.repository.BookingServiceItemRepository;
import com.kstn.group4.backend.exception.ForbiddenException;
import com.kstn.group4.backend.exception.ResourceNotFoundException;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final BookingRepository bookingRepository;
    private final BookingServiceItemRepository bookingServiceItemRepository;
    private final BookingPaymentService bookingPaymentService;

    @Transactional(readOnly = true)
    public byte[] createAdminInvoicePdf(Integer bookingId) {
        Booking booking = loadBooking(bookingId);
        return buildInvoicePdf(booking);
    }

    @Transactional(readOnly = true)
    public byte[] createPlayerInvoicePdf(Integer bookingId, Integer playerId) {
        Booking booking = loadBooking(bookingId);
        if (booking.getPlayer() == null || !booking.getPlayer().getId().equals(playerId)) {
            throw new ForbiddenException("You cannot export this invoice");
        }
        return buildInvoicePdf(booking);
    }

    private Booking loadBooking(Integer bookingId) {
        return bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId, "Booking"));
    }

    private byte[] buildInvoicePdf(Booking booking) {
        List<String> lines = new ArrayList<>();
        BigDecimal total = booking.getTotalPrice() != null ? booking.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal paid = bookingPaymentService.getPaidAmountWithLegacyFallback(booking);
        BigDecimal due = total.subtract(paid);
        if (due.compareTo(BigDecimal.ZERO) < 0) {
            due = BigDecimal.ZERO;
        }

        lines.add("MIXIFOOT INVOICE");
        lines.add("Invoice: #" + booking.getId());
        lines.add("Generated at: " + LocalDateTime.now().format(DATE_TIME_FORMAT));
        lines.add("");
        lines.add("Customer: " + value(booking.getPlayer() != null ? booking.getPlayer().getUsername() : null));
        lines.add("Phone: " + value(booking.getPlayer() != null ? booking.getPlayer().getPhoneNumber() : null));
        lines.add("Email: " + value(booking.getPlayer() != null ? booking.getPlayer().getEmail() : null));
        lines.add("");
        lines.add("Venue: " + value(booking.getPitch() != null && booking.getPitch().getVenue() != null
                ? booking.getPitch().getVenue().getName()
                : null));
        lines.add("Pitch: " + value(booking.getPitch() != null ? booking.getPitch().getName() : null));
        lines.add("Date: " + (booking.getBookingDate() != null ? booking.getBookingDate().format(DATE_FORMAT) : "N/A"));
        lines.add("Time: " + value(booking.getStartTime()) + " - " + value(booking.getEndTime()));
        lines.add("Status: " + value(booking.getStatus()));
        lines.add("");
        lines.add("ITEMS");
        lines.add("Field and initial services: " + money(total));

        bookingServiceItemRepository.findByBookingId(booking.getId()).forEach(item -> {
            BigDecimal price = item.getPriceAtBooking() != null ? item.getPriceAtBooking() : BigDecimal.ZERO;
            int quantity = item.getQuantity() != null ? item.getQuantity() : 0;
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(quantity));
            lines.add("- " + value(item.getService() != null ? item.getService().getName() : null)
                    + " x" + quantity + ": " + money(lineTotal));
        });

        lines.add("");
        lines.add("PAYMENTS");
        List<BookingPayment> payments = bookingPaymentService.getPaymentHistory(booking.getId());
        if (payments.isEmpty() && paid.compareTo(BigDecimal.ZERO) > 0) {
            lines.add("- Legacy deposit: " + money(paid));
        } else if (payments.isEmpty()) {
            lines.add("- No payment recorded");
        } else {
            for (BookingPayment payment : payments) {
                lines.add("- " + value(payment.getPaymentMethod()) + " at "
                        + (payment.getPaidAt() != null ? payment.getPaidAt().format(DATE_TIME_FORMAT) : "N/A")
                        + ": " + money(payment.getPaidAmount()));
            }
        }

        lines.add("");
        lines.add("Total: " + money(total));
        lines.add("Paid: " + money(paid));
        lines.add("Remaining: " + money(due));
        lines.add("");
        lines.add("Thank you for using MIXIFOOT.");

        return createSimplePdf(lines);
    }

    private byte[] createSimplePdf(List<String> rawLines) {
        List<String> lines = rawLines.stream()
                .flatMap(line -> wrap(ascii(line), 88).stream())
                .limit(48)
                .toList();

        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 12 Tf\n50 780 Td\n16 TL\n");
        for (String line : lines) {
            content.append("(").append(escapePdfText(line)).append(") Tj\nT*\n");
        }
        content.append("ET\n");

        byte[] contentBytes = content.toString().getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);

        List<byte[]> objects = new ArrayList<>();
        objects.add("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
        objects.add("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n".getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
        objects.add(("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
                + "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n")
                .getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
        objects.add("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n".getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
        objects.add(("5 0 obj\n<< /Length " + contentBytes.length + " >>\nstream\n"
                + content + "endstream\nendobj\n").getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        write(out, "%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        offsets.add(0);
        for (byte[] object : objects) {
            offsets.add(out.size());
            out.writeBytes(object);
        }

        int xrefOffset = out.size();
        write(out, "xref\n0 " + (objects.size() + 1) + "\n");
        write(out, "0000000000 65535 f \n");
        for (int i = 1; i < offsets.size(); i++) {
            write(out, String.format("%010d 00000 n \n", offsets.get(i)));
        }
        write(out, "trailer\n<< /Size " + (objects.size() + 1) + " /Root 1 0 R >>\n");
        write(out, "startxref\n" + xrefOffset + "\n%%EOF\n");
        return out.toByteArray();
    }

    private void write(ByteArrayOutputStream out, String value) {
        out.writeBytes(value.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
    }

    private List<String> wrap(String line, int maxLength) {
        List<String> result = new ArrayList<>();
        if (line.length() <= maxLength) {
            result.add(line);
            return result;
        }
        String remaining = line;
        while (remaining.length() > maxLength) {
            int splitAt = remaining.lastIndexOf(' ', maxLength);
            if (splitAt <= 0) {
                splitAt = maxLength;
            }
            result.add(remaining.substring(0, splitAt));
            remaining = remaining.substring(splitAt).trim();
        }
        if (!remaining.isEmpty()) {
            result.add(remaining);
        }
        return result;
    }

    private String escapePdfText(String text) {
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }

    private String ascii(String text) {
        String normalized = Normalizer.normalize(text.replace('Đ', 'D').replace('đ', 'd'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.replaceAll("[^\\x20-\\x7E]", "?");
    }

    private String value(Object value) {
        return value != null ? String.valueOf(value) : "N/A";
    }

    private String money(BigDecimal amount) {
        BigDecimal safeAmount = amount != null ? amount : BigDecimal.ZERO;
        return NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN")).format(safeAmount) + " VND";
    }
}
