package com.kstn.group4.backend.dto.manager;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentOrderDto {

    private Long id;
    private String customerName;
    private String fieldName;
    private LocalDateTime bookingTime;
    private Double price;
    private String status;
}