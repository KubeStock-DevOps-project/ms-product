package com.kubestock.product.dto;

import com.kubestock.product.model.ProductStatus;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FullProductResponseDTO {

    private UUID id;
    private String name;
    private String description;
    private UUID categoryId;
    private String mainImageUrl;
    private ProductStatus status;
    private List<ProductVariantResponseDTO> variants;
}
