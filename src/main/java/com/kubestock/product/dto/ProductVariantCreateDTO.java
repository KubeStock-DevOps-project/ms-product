package com.kubestock.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ProductVariantCreateDTO {

    @NotBlank
    private String sku;

    @NotNull
    private Map<String, Object> attributes;

    @NotBlank
    private String unitOfMeasure;

    @Builder.Default
    private List<String> imageUrls = List.of();
}
