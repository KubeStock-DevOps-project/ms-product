package com.kubestock.product.dto;

import com.kubestock.product.model.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class ProductCreateDTO {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private UUID categoryId;

    private String mainImageUrl;

    private ProductStatus status;

    @Valid
    @NotEmpty
    private List<ProductVariantCreateDTO> variants;
}
