package com.kubestock.product.specification;

import com.kubestock.product.model.Product;
import com.kubestock.product.model.ProductStatus;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> withFilters(UUID categoryId, ProductStatus status) {
        Specification<Product> specification = null;
        if (categoryId != null) {
            specification = hasCategoryId(categoryId);
        }
        if (status != null) {
            specification = specification == null ? hasStatus(status) : specification.and(hasStatus(status));
        }
        return specification;
    }

    private static Specification<Product> hasCategoryId(UUID categoryId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("categoryId"), categoryId);
    }

    private static Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status);
    }
}
