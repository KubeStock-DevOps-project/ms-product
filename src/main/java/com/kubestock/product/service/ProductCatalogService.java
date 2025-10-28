package com.kubestock.product.service;

import com.kubestock.product.dto.CategoryRequestDTO;
import com.kubestock.product.dto.CategoryResponseDTO;
import com.kubestock.product.dto.FullProductResponseDTO;
import com.kubestock.product.dto.ProductCreateDTO;
import com.kubestock.product.dto.ProductResponseDTO;
import com.kubestock.product.dto.ProductUpdateDTO;
import com.kubestock.product.dto.ProductVariantCreateDTO;
import com.kubestock.product.dto.ProductVariantResponseDTO;
import com.kubestock.product.dto.ProductVariantUpdateDTO;
import com.kubestock.product.model.ProductStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductCatalogService {

    CategoryResponseDTO createCategory(CategoryRequestDTO request);

    List<CategoryResponseDTO> getAllCategories();

    CategoryResponseDTO getCategory(UUID id);

    CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO request);

    void deleteCategory(UUID id);

    FullProductResponseDTO createProduct(ProductCreateDTO request);

    Page<ProductResponseDTO> getProducts(Pageable pageable, UUID categoryId, ProductStatus status);

    FullProductResponseDTO getProduct(UUID id);

    ProductVariantResponseDTO getVariantBySku(String sku);

    FullProductResponseDTO updateProduct(UUID id, ProductUpdateDTO request);

    ProductVariantResponseDTO addVariant(UUID productId, ProductVariantCreateDTO request);

    ProductVariantResponseDTO updateVariant(UUID variantId, ProductVariantUpdateDTO request);

    FullProductResponseDTO archiveProduct(UUID id);
}
