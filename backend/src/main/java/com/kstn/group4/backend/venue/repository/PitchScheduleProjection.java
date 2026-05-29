package com.kstn.group4.backend.venue.repository;

import java.math.BigDecimal;
import java.time.LocalTime;

public interface PitchScheduleProjection {
    Long getPitchId();
    String getPitchName();
    String getVenueName();
    Long getTimeSlotId();
    Integer getSlotNumber();
    LocalTime getStartTime();
    LocalTime getEndTime();
    Boolean getIsActive();
    String getBookingStatus();
    String getCustomerName();
    String getCustomerPhone();
    BigDecimal getDepositAmount();
    BigDecimal getPrice();
}