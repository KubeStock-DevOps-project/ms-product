package com.kubestock.product.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantUpdateDTO {

    private String sku;
    private Map<String, Object> attributes;
    private String unitOfMeasure;
    private List<String> imageUrls;
}
