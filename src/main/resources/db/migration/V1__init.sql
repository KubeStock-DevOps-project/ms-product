CREATE TABLE categories
(
    id        UUID         NOT NULL,
    name      VARCHAR(255) NOT NULL,
    parent_id UUID,
    CONSTRAINT pk_categories PRIMARY KEY (id)
);

CREATE TABLE product_variant_images
(
    variant_id UUID NOT NULL,
    image_url  VARCHAR(255)
);

CREATE TABLE product_variants
(
    id              UUID         NOT NULL,
    sku             VARCHAR(255) NOT NULL,
    product_id      UUID         NOT NULL,
    unit_of_measure VARCHAR(255) NOT NULL,
    attributes      JSONB,
    CONSTRAINT pk_product_variants PRIMARY KEY (id)
);

CREATE TABLE products
(
    id             UUID         NOT NULL,
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    category_id    UUID         NOT NULL,
    main_image_url VARCHAR(255),
    status         VARCHAR(255) NOT NULL,
    CONSTRAINT pk_products PRIMARY KEY (id)
);

ALTER TABLE product_variants
    ADD CONSTRAINT uc_product_variants_sku UNIQUE (sku);

ALTER TABLE product_variant_images
    ADD CONSTRAINT fk_product_variant_images_on_product_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id);