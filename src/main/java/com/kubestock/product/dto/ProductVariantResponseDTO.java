package com.kubestock.product.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponseDTO {

    private UUID id;
    private String sku;
    private UUID productId;
    private String unitOfMeasure;
    private Map<String, Object> attributes;
    private List<String> imageUrls;
}
