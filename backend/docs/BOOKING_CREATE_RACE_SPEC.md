# Backend API Create Booking - Race Safety + Logging Spec

## Overview
This document describes the create-booking API behavior with race-condition protection, conflict handling, and logging requirements.

## Endpoint
- Method: POST
- Path: /player/bookings
- Auth: PLAYER

## Request
Content-Type: application/json

Fields (CreateBookingRequest):
- pitchId (int, required)
- timeSlotId (int, required)
- bookingDate (YYYY-MM-DD, required)

Example:
{
  "pitchId": 1,
  "timeSlotId": 8,
  "bookingDate": "2026-06-06"
}

## Success Response
- Status: 201 Created
- Body: PlayerBookingResponse

Fields:
- id
- pitchId
- pitchName
- bookingDate
- startTime
- endTime
- totalPrice
- depositAmount
- status

## Failure Responses
- 400 Bad Request
  - INVALID_BOOKING_DATE
  - TIMESLOT_NOT_ASSOCIATED_WITH_PITCH
  - TIMESLOT_PITCH_MISMATCH
  - OUT_OF_OPERATING_HOURS
  - PRICE_NOT_SET
- 404 Not Found
  - User not found
  - TimeSlot not found
  - Venue not found
- 409 Conflict
  - Message: "Ca dat san nay da duoc dat. Vui long chon ca khac"
  - Cause: slot already booked or unique constraint conflict

## Race-Condition Protection
- Transactional boundary: BookingService.createBooking is @Transactional.
- Pessimistic lock: TimeSlotRepository.findByIdForUpdate uses PESSIMISTIC_WRITE.
- Double-check: bookingRepository.existsByTimeSlotIdAndBookingDate before save.
- DB constraint: UNIQUE (booking_date, time_slot_id) on bookings table.

## Conflict Handling
If DB unique constraint is violated during save, the service returns 409 Conflict with the same message as the early-check conflict.

## Logging Requirements
Log events when race conditions are detected:

1) Early check conflict
- Level: WARN
- Message template:
  BOOKING_RACE status=FAILED reason=ALREADY_BOOKED playerId={playerId} pitchId={pitchId} timeSlotId={timeSlotId} bookingDate={bookingDate}

2) Unique constraint conflict
- Level: WARN
- Message template:
  BOOKING_RACE status=FAILED reason=UNIQUE_CONSTRAINT playerId={playerId} pitchId={pitchId} timeSlotId={timeSlotId} bookingDate={bookingDate}

## Notes
- Only one booking can succeed for the same (bookingDate, timeSlotId).
- Competing requests must result in one success (201) and others returning 409.

## Recommended Tests
- Concurrent booking requests on same slot/date should yield one 201 and the rest 409.
- Verify WARN logs for both early-check and unique-constraint conflicts.

