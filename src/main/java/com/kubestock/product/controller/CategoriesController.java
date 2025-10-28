package com.kubestock.product.controller;

import com.kubestock.product.dto.CategoryRequestDTO;
import com.kubestock.product.dto.CategoryResponseDTO;
import com.kubestock.product.service.ProductCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Validated
public class CategoriesController {

    private final ProductCatalogService productCatalogService;

    @PostMapping
    @Operation(summary = "Create category", description = "Creates a new product category")
    @ApiResponse(responseCode = "201", description = "Category created successfully")
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO request) {
        CategoryResponseDTO response = productCatalogService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List categories", description = "Retrieves all product categories")
    @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(productCatalogService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category", description = "Retrieves a category by its identifier")
    @ApiResponse(responseCode = "200", description = "Category retrieved successfully")
    public ResponseEntity<CategoryResponseDTO> getCategory(@PathVariable UUID id) {
        return ResponseEntity.ok(productCatalogService.getCategory(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Updates an existing product category")
    @ApiResponse(responseCode = "200", description = "Category updated successfully")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable UUID id,
                                                              @Valid @RequestBody CategoryRequestDTO request) {
        return ResponseEntity.ok(productCatalogService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Deletes a product category")
    @ApiResponse(responseCode = "204", description = "Category deleted successfully")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        productCatalogService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
