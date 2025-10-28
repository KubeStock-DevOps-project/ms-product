package com.kubestock.product.dto;

import com.kubestock.product.model.ProductStatus;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {

    private UUID id;
    private String name;
    private String description;
    private UUID categoryId;
    private String mainImageUrl;
    private ProductStatus status;
}
