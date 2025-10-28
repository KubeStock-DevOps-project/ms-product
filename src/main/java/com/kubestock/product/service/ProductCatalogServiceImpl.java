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
import com.kubestock.product.exception.BadRequestException;
import com.kubestock.product.exception.ResourceNotFoundException;
import com.kubestock.product.model.Category;
import com.kubestock.product.model.Product;
import com.kubestock.product.model.ProductStatus;
import com.kubestock.product.model.ProductVariant;
import com.kubestock.product.repository.CategoryRepository;
import com.kubestock.product.repository.ProductRepository;
import com.kubestock.product.repository.ProductVariantRepository;
import com.kubestock.product.specification.ProductSpecifications;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCatalogServiceImpl implements ProductCatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        UUID parentId = request.getParentId();
        if (parentId != null) {
            validateCategoryExists(parentId);
        }
        Category category = Category.builder()
                .name(request.getName())
                .parentId(parentId)
                .build();
        Category saved = categoryRepository.save(category);
        return toCategoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category %s not found".formatted(id)));
        return toCategoryResponse(category);
    }

    @Override
    public CategoryResponseDTO updateCategory(UUID id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category %s not found".formatted(id)));
        UUID parentId = request.getParentId();
        if (parentId != null) {
            if (parentId.equals(id)) {
                throw new BadRequestException("A category cannot be its own parent");
            }
            validateCategoryExists(parentId);
        }
        category.setName(request.getName());
        category.setParentId(parentId);
        Category saved = categoryRepository.save(category);
        return toCategoryResponse(saved);
    }

    @Override
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category %s not found".formatted(id));
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public FullProductResponseDTO createProduct(ProductCreateDTO request) {
        validateCategoryExists(request.getCategoryId());
        ProductStatus status = request.getStatus() != null ? request.getStatus() : ProductStatus.DRAFT;
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .categoryId(request.getCategoryId())
                .mainImageUrl(request.getMainImageUrl())
                .status(status)
                .build();
        Product savedProduct = productRepository.save(product);

        List<ProductVariant> variants = request.getVariants().stream()
                .map(variantRequest -> buildVariant(savedProduct.getId(), variantRequest))
                .toList();
        List<ProductVariant> savedVariants = productVariantRepository.saveAll(variants);
        return toFullProductResponse(savedProduct, savedVariants);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getProducts(Pageable pageable, UUID categoryId, ProductStatus status) {
        Specification<Product> specification = ProductSpecifications.withFilters(categoryId, status);
        Page<Product> page = specification == null ?
                productRepository.findAll(pageable) :
                productRepository.findAll(specification, pageable);
        return page.map(this::toProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FullProductResponseDTO getProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product %s not found".formatted(id)));
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        return toFullProductResponse(product, variants);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponseDTO getVariantBySku(String sku) {
        ProductVariant variant = productVariantRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Variant with SKU %s not found".formatted(sku)));
        return toVariantResponse(variant);
    }

    @Override
    public FullProductResponseDTO updateProduct(UUID id, ProductUpdateDTO request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product %s not found".formatted(id)));
        validateCategoryExists(request.getCategoryId());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setMainImageUrl(request.getMainImageUrl());
        product.setCategoryId(request.getCategoryId());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        Product saved = productRepository.save(product);
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        return toFullProductResponse(saved, variants);
    }

    @Override
    public ProductVariantResponseDTO addVariant(UUID productId, ProductVariantCreateDTO request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product %s not found".formatted(productId)));
        ensureSkuIsUnique(request.getSku(), null);
        ProductVariant variant = buildVariant(product.getId(), request);
        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toVariantResponse(savedVariant);
    }

    @Override
    public ProductVariantResponseDTO updateVariant(UUID variantId, ProductVariantUpdateDTO request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant %s not found".formatted(variantId)));
        if (request.getSku() != null && !request.getSku().equals(variant.getSku())) {
            ensureSkuIsUnique(request.getSku(), variantId);
            variant.setSku(request.getSku());
        }
        if (request.getUnitOfMeasure() != null) {
            variant.setUnitOfMeasure(request.getUnitOfMeasure());
        }
        if (request.getAttributes() != null) {
            variant.setAttributes(request.getAttributes());
        }
        if (request.getImageUrls() != null) {
            variant.setImageUrls(new ArrayList<>(request.getImageUrls()));
        }
        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toVariantResponse(savedVariant);
    }

    @Override
    public FullProductResponseDTO archiveProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product %s not found".formatted(id)));
        product.setStatus(ProductStatus.ARCHIVED);
        Product saved = productRepository.save(product);
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        return toFullProductResponse(saved, variants);
    }

    private void validateCategoryExists(UUID categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new BadRequestException("Category %s does not exist".formatted(categoryId));
        }
    }

    private ProductVariant buildVariant(UUID productId, ProductVariantCreateDTO request) {
        Map<String, Object> attributes = request.getAttributes() != null ? request.getAttributes() : Collections.emptyMap();
        List<String> imageUrls = request.getImageUrls() != null ? new ArrayList<>(request.getImageUrls()) : new ArrayList<>();
        return ProductVariant.builder()
                .productId(productId)
                .sku(request.getSku())
                .unitOfMeasure(request.getUnitOfMeasure())
                .attributes(attributes)
                .imageUrls(imageUrls)
                .build();
    }

    private ProductVariantResponseDTO toVariantResponse(ProductVariant variant) {
        return ProductVariantResponseDTO.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .productId(variant.getProductId())
                .unitOfMeasure(variant.getUnitOfMeasure())
                .attributes(variant.getAttributes())
                .imageUrls(variant.getImageUrls())
                .build();
    }

    private FullProductResponseDTO toFullProductResponse(Product product, List<ProductVariant> variants) {
        return FullProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .mainImageUrl(product.getMainImageUrl())
                .status(product.getStatus())
                .variants(variants.stream().map(this::toVariantResponse).collect(Collectors.toList()))
                .build();
    }

    private ProductResponseDTO toProductResponse(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .mainImageUrl(product.getMainImageUrl())
                .status(product.getStatus())
                .build();
    }

    private CategoryResponseDTO toCategoryResponse(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParentId())
                .build();
    }

    private void ensureSkuIsUnique(String sku, UUID currentVariantId) {
        productVariantRepository.findBySku(sku).ifPresent(existing -> {
            if (currentVariantId == null || !existing.getId().equals(currentVariantId)) {
                throw new BadRequestException("SKU %s is already in use".formatted(sku));
            }
        });
    }
}
