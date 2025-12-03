/**
 * Unit Tests for Utility Functions
 * Tests helper functions and data transformations
 */

describe('Product Data Utilities', () => {
  // Product data transformation utilities
  const formatProductResponse = (product) => {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      categoryId: product.category_id,
      categoryName: product.category_name,
      size: product.size || null,
      color: product.color || null,
      unitPrice: parseFloat(product.unit_price),
      isActive: product.is_active,
      attributes: product.attributes || {},
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  };

  const sanitizeSku = (sku) => {
    return sku.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  };

  const isValidPrice = (price) => {
    return typeof price === 'number' && price > 0 && isFinite(price);
  };

  const parseSearchFilters = (query) => {
    const filters = {};
    if (query.category_id) filters.category_id = parseInt(query.category_id);
    if (query.is_active !== undefined) filters.is_active = query.is_active === 'true';
    if (query.search) filters.search = query.search.trim();
    if (query.min_price) filters.min_price = parseFloat(query.min_price);
    if (query.max_price) filters.max_price = parseFloat(query.max_price);
    return filters;
  };

  describe('formatProductResponse', () => {
    test('should format product data correctly', () => {
      const rawProduct = {
        id: 1,
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'A test description',
        category_id: 2,
        category_name: 'Electronics',
        size: 'Large',
        color: 'Red',
        unit_price: '29.99',
        is_active: true,
        attributes: { weight: '1kg' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const formatted = formatProductResponse(rawProduct);

      expect(formatted.id).toBe(1);
      expect(formatted.sku).toBe('PROD-001');
      expect(formatted.unitPrice).toBe(29.99);
      expect(formatted.categoryId).toBe(2);
      expect(formatted.isActive).toBe(true);
    });

    test('should handle null optional fields', () => {
      const rawProduct = {
        id: 1,
        sku: 'PROD-002',
        name: 'Minimal Product',
        description: null,
        category_id: null,
        category_name: null,
        size: null,
        color: null,
        unit_price: '10.00',
        is_active: true,
        attributes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const formatted = formatProductResponse(rawProduct);

      expect(formatted.description).toBe('');
      expect(formatted.size).toBeNull();
      expect(formatted.color).toBeNull();
      expect(formatted.attributes).toEqual({});
    });
  });

  describe('sanitizeSku', () => {
    test('should uppercase SKU', () => {
      expect(sanitizeSku('prod-001')).toBe('PROD-001');
    });

    test('should remove special characters', () => {
      expect(sanitizeSku('prod@001!abc')).toBe('PROD001ABC');
    });

    test('should allow hyphens', () => {
      expect(sanitizeSku('PROD-001-ABC')).toBe('PROD-001-ABC');
    });

    test('should handle empty string', () => {
      expect(sanitizeSku('')).toBe('');
    });
  });

  describe('isValidPrice', () => {
    test('should accept positive numbers', () => {
      expect(isValidPrice(29.99)).toBe(true);
      expect(isValidPrice(1)).toBe(true);
      expect(isValidPrice(0.01)).toBe(true);
    });

    test('should reject zero', () => {
      expect(isValidPrice(0)).toBe(false);
    });

    test('should reject negative numbers', () => {
      expect(isValidPrice(-10)).toBe(false);
    });

    test('should reject non-numbers', () => {
      expect(isValidPrice('29.99')).toBe(false);
      expect(isValidPrice(null)).toBe(false);
      expect(isValidPrice(undefined)).toBe(false);
    });

    test('should reject Infinity', () => {
      expect(isValidPrice(Infinity)).toBe(false);
    });
  });

  describe('parseSearchFilters', () => {
    test('should parse category_id as integer', () => {
      const filters = parseSearchFilters({ category_id: '5' });
      expect(filters.category_id).toBe(5);
    });

    test('should parse is_active as boolean', () => {
      expect(parseSearchFilters({ is_active: 'true' }).is_active).toBe(true);
      expect(parseSearchFilters({ is_active: 'false' }).is_active).toBe(false);
    });

    test('should trim search string', () => {
      const filters = parseSearchFilters({ search: '  laptop  ' });
      expect(filters.search).toBe('laptop');
    });

    test('should parse price range', () => {
      const filters = parseSearchFilters({ min_price: '10.00', max_price: '100.00' });
      expect(filters.min_price).toBe(10.00);
      expect(filters.max_price).toBe(100.00);
    });

    test('should return empty object for no filters', () => {
      const filters = parseSearchFilters({});
      expect(filters).toEqual({});
    });
  });
});

describe('Response Helpers', () => {
  const createSuccessResponse = (data, message = 'Success') => {
    return {
      success: true,
      message,
      data,
    };
  };

  const createErrorResponse = (message, errors = null) => {
    const response = {
      success: false,
      message,
    };
    if (errors) response.errors = errors;
    return response;
  };

  const createPaginatedResponse = (data, page, limit, total) => {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  test('should create success response', () => {
    const response = createSuccessResponse({ id: 1 }, 'Product created');
    expect(response.success).toBe(true);
    expect(response.message).toBe('Product created');
    expect(response.data.id).toBe(1);
  });

  test('should create error response', () => {
    const response = createErrorResponse('Validation failed', [{ field: 'name' }]);
    expect(response.success).toBe(false);
    expect(response.errors).toHaveLength(1);
  });

  test('should create paginated response', () => {
    const response = createPaginatedResponse([1, 2, 3], 1, 10, 25);
    expect(response.pagination.page).toBe(1);
    expect(response.pagination.totalPages).toBe(3);
  });
});
