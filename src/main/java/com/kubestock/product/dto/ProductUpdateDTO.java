package com.kubestock.product.dto;

import com.kubestock.product.model.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateDTO {

    @NotBlank
    private String name;

    private String description;

    private String mainImageUrl;

    @NotNull
    private UUID categoryId;

    private ProductStatus status;
}
