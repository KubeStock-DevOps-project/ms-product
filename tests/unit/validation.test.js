/**
 * Unit Tests for Validation Middleware
 * Tests Joi schema validation for products and categories
 */

const Joi = require('joi');

// Recreate schemas for testing (avoiding database dependencies)
const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
});

const createProductSchema = Joi.object({
  sku: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  category_id: Joi.number().integer().positive().optional(),
  size: Joi.string().max(20).optional().allow(''),
  color: Joi.string().max(50).optional().allow(''),
  unit_price: Joi.number().positive().precision(2).required(),
  attributes: Joi.object().optional(),
});

const updateProductSchema = Joi.object({
  sku: Joi.string().min(2).max(50).optional(),
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  category_id: Joi.number().integer().positive().optional().allow(null),
  size: Joi.string().max(20).optional().allow(''),
  color: Joi.string().max(50).optional().allow(''),
  unit_price: Joi.number().positive().precision(2).optional(),
  attributes: Joi.object().optional(),
  is_active: Joi.boolean().optional(),
});

describe('Validation Schemas', () => {
  describe('createCategorySchema', () => {
    test('should validate a valid category', () => {
      const validCategory = {
        name: 'Electronics',
        description: 'Electronic products and gadgets',
      };
      const { error } = createCategorySchema.validate(validCategory);
      expect(error).toBeUndefined();
    });

    test('should reject category with name too short', () => {
      const invalidCategory = {
        name: 'A',
        description: 'Too short name',
      };
      const { error } = createCategorySchema.validate(invalidCategory);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    test('should reject category without name', () => {
      const invalidCategory = {
        description: 'Missing name field',
      };
      const { error } = createCategorySchema.validate(invalidCategory);
      expect(error).toBeDefined();
      expect(error.details[0].type).toBe('any.required');
    });

    test('should allow empty description', () => {
      const category = {
        name: 'Clothing',
        description: '',
      };
      const { error } = createCategorySchema.validate(category);
      expect(error).toBeUndefined();
    });
  });

  describe('createProductSchema', () => {
    test('should validate a valid product', () => {
      const validProduct = {
        sku: 'PROD-001',
        name: 'Test Product',
        description: 'A test product description',
        category_id: 1,
        size: 'Medium',
        color: 'Blue',
        unit_price: 29.99,
        attributes: { weight: '500g' },
      };
      const { error } = createProductSchema.validate(validProduct);
      expect(error).toBeUndefined();
    });

    test('should reject product without required sku', () => {
      const invalidProduct = {
        name: 'Test Product',
        unit_price: 29.99,
      };
      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('sku');
    });

    test('should reject product without required name', () => {
      const invalidProduct = {
        sku: 'PROD-001',
        unit_price: 29.99,
      };
      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    test('should reject product without unit_price', () => {
      const invalidProduct = {
        sku: 'PROD-001',
        name: 'Test Product',
      };
      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('unit_price');
    });

    test('should reject negative unit_price', () => {
      const invalidProduct = {
        sku: 'PROD-001',
        name: 'Test Product',
        unit_price: -10.00,
      };
      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('unit_price');
    });

    test('should reject zero unit_price', () => {
      const invalidProduct = {
        sku: 'PROD-001',
        name: 'Test Product',
        unit_price: 0,
      };
      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
    });
  });

  describe('updateProductSchema', () => {
    test('should validate partial update', () => {
      const partialUpdate = {
        name: 'Updated Name',
      };
      const { error } = updateProductSchema.validate(partialUpdate);
      expect(error).toBeUndefined();
    });

    test('should allow is_active boolean', () => {
      const update = {
        is_active: false,
      };
      const { error } = updateProductSchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should allow null category_id', () => {
      const update = {
        category_id: null,
      };
      const { error } = updateProductSchema.validate(update);
      expect(error).toBeUndefined();
    });
  });
});
