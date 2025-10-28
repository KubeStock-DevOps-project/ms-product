package com.kubestock.product.model;

import com.kubestock.product.util.JsonToMapConverter;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "unit_of_measure", nullable = false)
    private String unitOfMeasure;

    @Convert(converter = JsonToMapConverter.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;

    @ElementCollection
    @CollectionTable(name = "product_variant_images", joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
}
