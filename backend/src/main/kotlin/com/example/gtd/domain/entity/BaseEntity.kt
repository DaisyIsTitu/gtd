package com.example.gtd.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@MappedSuperclass
abstract class BaseEntity {
    
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
        protected set
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
        protected set
    
    @PrePersist
    protected fun onCreate() {
        createdAt = LocalDateTime.now()
        updatedAt = LocalDateTime.now()
    }
    
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}