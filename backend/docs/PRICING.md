# Booking Pricing Logic

## Overview
Pricing for bookings is dynamically calculated using a base price set for the pitch and various coefficients for the time slot.

## Formulas
The base formula is:
`Total Price = Base Price * Coefficient`

The Coefficient is determined by:
1. Lookup in `price_rules` using `pitch_id`, `slot_number`, and `is_weekend`.
2. If no rule is explicitly defined, the fallback logic uses `1.0` as the baseline coefficient, adding `+0.2` if it's a weekend, and `+0.3` if it falls during "Golden Hours".

### Golden Hours
Golden hours are defined as any time slot starting between 17:00 and 21:59 (inclusive).

## Cancellations
When a booking's status changes to `CANCELLED`, the system recalculates the final `total_price` as the penalty for cancellation. The penalty equals the initial `depositAmount` (which is typically 50% of the original calculated price).

## Manual Price Overrides
Admins have the capability to manually hotfix the price of any booking via the endpoint `PUT /api/admin/bookings/{id}/price`.
When a price is manually updated:
- The `total_price` reflects the new manual amount.
- The booking's `pricing_mode` flag changes from `AUTO` to `MANUAL`.
- Subsequent cancellations will **NOT** recalculate the `total_price` back to the deposit amount, respecting the manual override.
