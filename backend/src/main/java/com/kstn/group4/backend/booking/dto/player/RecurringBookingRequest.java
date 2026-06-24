package com.kstn.group4.backend.booking.dto.player;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class RecurringBookingRequest {

    @NotNull(message = "pitchId không được để trống")
    private Integer pitchId;

    @NotNull(message = "timeSlotId không được để trống")
    private Integer timeSlotId;

    @NotNull(message = "startDate không được để trống")
    @FutureOrPresent(message = "startDate phải từ hôm nay trở đi")
    private LocalDate startDate;

    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;

    private Set<DayOfWeek> daysOfWeek;

    @Min(value = 1, message = "numberOfWeeks phải lớn hơn 0")
    @Max(value = 52, message = "numberOfWeeks không được vượt quá 52")
    private Integer numberOfWeeks;

    @Min(value = 1, message = "numberOfMonths phải lớn hơn 0")
    @Max(value = 12, message = "numberOfMonths không được vượt quá 12")
    private Integer numberOfMonths;

    @Min(value = 1, message = "dayOfMonth phải từ 1 đến 31")
    @Max(value = 31, message = "dayOfMonth phải từ 1 đến 31")
    private Integer dayOfMonth;

    private Boolean skipConflicts = Boolean.TRUE;

    @Valid
    private List<CreateBookingRequest.ServiceRequest> services;

    public Integer getPitchId() {
        return pitchId;
    }

    public void setPitchId(Integer pitchId) {
        this.pitchId = pitchId;
    }

    public Integer getTimeSlotId() {
        return timeSlotId;
    }

    public void setTimeSlotId(Integer timeSlotId) {
        this.timeSlotId = timeSlotId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public RecurrenceType getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(RecurrenceType recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public Set<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(Set<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public Integer getNumberOfWeeks() {
        return numberOfWeeks;
    }

    public void setNumberOfWeeks(Integer numberOfWeeks) {
        this.numberOfWeeks = numberOfWeeks;
    }

    public Integer getNumberOfMonths() {
        return numberOfMonths;
    }

    public void setNumberOfMonths(Integer numberOfMonths) {
        this.numberOfMonths = numberOfMonths;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public void setDayOfMonth(Integer dayOfMonth) {
        this.dayOfMonth = dayOfMonth;
    }

    public Boolean getSkipConflicts() {
        return skipConflicts;
    }

    public void setSkipConflicts(Boolean skipConflicts) {
        this.skipConflicts = skipConflicts;
    }

    public List<CreateBookingRequest.ServiceRequest> getServices() {
        return services;
    }

    public void setServices(List<CreateBookingRequest.ServiceRequest> services) {
        this.services = services;
    }

    public enum RecurrenceType {
        WEEKLY,
        MONTHLY
    }
}
