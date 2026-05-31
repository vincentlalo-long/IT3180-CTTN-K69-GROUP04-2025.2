package com.kstn.group4.backend.venue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "price_rules",
    uniqueConstraints = @UniqueConstraint(columnNames = {"pitch_id", "slot_number", "is_weekend"})
)
public class PriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pitch_id")
    private Pitch pitch;

    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber;

    @Column(name = "is_weekend", nullable = false)
    private Boolean isWeekend;

    @Column(name = "coefficient", nullable = false)
    private BigDecimal coefficient;
}