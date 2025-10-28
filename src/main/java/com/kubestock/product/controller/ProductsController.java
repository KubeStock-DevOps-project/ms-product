package com.kubestock.product.controller;

import com.kubestock.product.dto.FullProductResponseDTO;
import com.kubestock.product.dto.ProductCreateDTO;
import com.kubestock.product.dto.ProductResponseDTO;
import com.kubestock.product.dto.ProductUpdateDTO;
import com.kubestock.product.dto.ProductVariantCreateDTO;
import com.kubestock.product.dto.ProductVariantResponseDTO;
import com.kubestock.product.dto.ProductVariantUpdateDTO;
import com.kubestock.product.model.ProductStatus;
import com.kubestock.product.service.ProductCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Validated
public class ProductsController {

    private final ProductCatalogService productCatalogService;

    @PostMapping
    @Operation(summary = "Create product", description = "Creates a product with its variants in one transaction")
    @ApiResponse(responseCode = "201", description = "Product created successfully")
    public ResponseEntity<FullProductResponseDTO> createProduct(@Valid @RequestBody ProductCreateDTO request) {
        FullProductResponseDTO response = productCatalogService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List products", description = "Retrieves a paginated list of products with optional filters")
    @ApiResponse(responseCode = "200", description = "Products retrieved successfully")
    public ResponseEntity<Page<ProductResponseDTO>> getProducts(
            @ParameterObject @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) ProductStatus status) {
        return ResponseEntity.ok(productCatalogService.getProducts(pageable, categoryId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product", description = "Retrieves a product with all of its variants")
    @ApiResponse(responseCode = "200", description = "Product retrieved successfully")
    public ResponseEntity<FullProductResponseDTO> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productCatalogService.getProduct(id));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Find variant by SKU", description = "Retrieves a product variant by its SKU")
    @ApiResponse(responseCode = "200", description = "Variant retrieved successfully")
    public ResponseEntity<ProductVariantResponseDTO> getVariantBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productCatalogService.getVariantBySku(sku));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates product core details")
    @ApiResponse(responseCode = "200", description = "Product updated successfully")
    public ResponseEntity<FullProductResponseDTO> updateProduct(@PathVariable UUID id,
                                                                @Valid @RequestBody ProductUpdateDTO request) {
        return ResponseEntity.ok(productCatalogService.updateProduct(id, request));
    }

    @PostMapping("/{id}/variants")
    @Operation(summary = "Add product variant", description = "Adds a new variant to an existing product")
    @ApiResponse(responseCode = "201", description = "Variant created successfully")
    public ResponseEntity<ProductVariantResponseDTO> addVariant(@PathVariable UUID id,
                                                                 @Valid @RequestBody ProductVariantCreateDTO request) {
        ProductVariantResponseDTO response = productCatalogService.addVariant(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/variants/{variantId}")
    @Operation(summary = "Update product variant", description = "Updates an existing product variant")
    @ApiResponse(responseCode = "200", description = "Variant updated successfully")
    public ResponseEntity<ProductVariantResponseDTO> updateVariant(@PathVariable UUID variantId,
                                                                   @Valid @RequestBody ProductVariantUpdateDTO request) {
        return ResponseEntity.ok(productCatalogService.updateVariant(variantId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive product", description = "Archives a product instead of deleting it")
    @ApiResponse(responseCode = "200", description = "Product archived successfully")
    public ResponseEntity<FullProductResponseDTO> archiveProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productCatalogService.archiveProduct(id));
    }
}
