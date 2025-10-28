package com.kubestock.product.repository;

import com.kubestock.product.model.ProductVariant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    Optional<ProductVariant> findBySku(String sku);

    List<ProductVariant> findByProductId(UUID productId);
}
