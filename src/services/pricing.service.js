const db = require("../config/database");
const logger = require("../config/logger");

/**
 * Production-Grade Pricing Engine
 * Handles: Dynamic pricing, bulk discounts, promotions, time-based pricing
 */
class PricingService {
  /**
   * Calculate final price with all applicable discounts and promotions
   * @param {number} productId - Product ID
   * @param {number} quantity - Order quantity
   * @param {number} customerId - Customer ID (for tier-based pricing)
   * @returns {object} - Pricing breakdown
   */
  async calculatePrice(productId, quantity = 1, customerId = null) {
    try {
      // Get base product price
      const product = await this.getProductWithPricing(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const basePrice = parseFloat(product.unit_price);
      let finalPrice = basePrice;
      let appliedDiscounts = [];

      // 1. Check bulk discounts (quantity-based)
      const bulkDiscount = await this.getBulkDiscount(productId, quantity);
      if (bulkDiscount) {
        const discountAmount =
          (basePrice * bulkDiscount.discount_percentage) / 100;
        finalPrice -= discountAmount;
        appliedDiscounts.push({
          type: "bulk",
          rule: bulkDiscount.rule_name,
          percentage: bulkDiscount.discount_percentage,
          amount: discountAmount * quantity,
        });
      }

      // 2. Check time-based promotions (flash sales, seasonal)
      const timePromo = await this.getActiveTimePromotion(productId);
      if (timePromo) {
        const promoAmount = (finalPrice * timePromo.discount_percentage) / 100;
        finalPrice -= promoAmount;
        appliedDiscounts.push({
          type: "promotion",
          rule: timePromo.promo_name,
          percentage: timePromo.discount_percentage,
          amount: promoAmount * quantity,
        });
      }

      // 3. Check category-wide discounts
      const categoryDiscount = await this.getCategoryDiscount(
        product.category_id
      );
      if (categoryDiscount) {
        const catAmount =
          (finalPrice * categoryDiscount.discount_percentage) / 100;
        finalPrice -= catAmount;
        appliedDiscounts.push({
          type: "category",
          rule: categoryDiscount.rule_name,
          percentage: categoryDiscount.discount_percentage,
          amount: catAmount * quantity,
        });
      }

      // 4. Check customer tier pricing (VIP, Gold, Silver)
      if (customerId) {
        const tierDiscount = await this.getCustomerTierDiscount(
          customerId,
          productId
        );
        if (tierDiscount) {
          const tierAmount =
            (finalPrice * tierDiscount.discount_percentage) / 100;
          finalPrice -= tierAmount;
          appliedDiscounts.push({
            type: "customer_tier",
            rule: `${tierDiscount.tier_name} Tier`,
            percentage: tierDiscount.discount_percentage,
            amount: tierAmount * quantity,
          });
        }
      }

      // Calculate totals
      const subtotal = basePrice * quantity;
      const totalDiscount = appliedDiscounts.reduce(
        (sum, d) => sum + d.amount,
        0
      );
      const finalTotal = (finalPrice * quantity).toFixed(2);

      logger.info(
        `Price calculated for product ${productId}: ${basePrice} → ${finalPrice}`
      );

      return {
        productId,
        productName: product.name,
        sku: product.sku,
        quantity,
        basePrice: parseFloat(basePrice.toFixed(2)),
        pricePerUnit: parseFloat(finalPrice.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        finalTotal: parseFloat(finalTotal),
        appliedDiscounts,
        calculatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error calculating price:", error);
      throw error;
    }
  }

  /**
   * Get product with pricing info
   */
  async getProductWithPricing(productId) {
    const query = `
      SELECT id, sku, name, unit_price, category_id, is_active
      FROM products
      WHERE id = $1 AND is_active = true
    `;
    const result = await db.query(query, [productId]);
    return result.rows[0];
  }

  /**
   * Check bulk discount rules
   */
  async getBulkDiscount(productId, quantity) {
    const query = `
      SELECT rule_name, min_quantity, discount_percentage
      FROM pricing_rules
      WHERE product_id = $1 
        AND rule_type = 'bulk'
        AND min_quantity <= $2
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
        AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
      ORDER BY min_quantity DESC
      LIMIT 1
    `;
    const result = await db.query(query, [productId, quantity]);
    return result.rows[0];
  }

  /**
   * Check active time-based promotions
   */
  async getActiveTimePromotion(productId) {
    const query = `
      SELECT promo_name, discount_percentage
      FROM pricing_rules
      WHERE (product_id = $1 OR product_id IS NULL)
        AND rule_type = 'promotion'
        AND is_active = true
        AND valid_from <= CURRENT_DATE
        AND valid_until >= CURRENT_DATE
      ORDER BY discount_percentage DESC
      LIMIT 1
    `;
    const result = await db.query(query, [productId]);
    return result.rows[0];
  }

  /**
   * Check category-wide discounts
   */
  async getCategoryDiscount(categoryId) {
    const query = `
      SELECT rule_name, discount_percentage
      FROM pricing_rules
      WHERE category_id = $1
        AND rule_type = 'category'
        AND is_active = true
        AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
        AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
      ORDER BY discount_percentage DESC
      LIMIT 1
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0];
  }

  /**
   * Check customer tier discounts (VIP, Gold, Silver)
   */
  async getCustomerTierDiscount(customerId, productId) {
    // Mock implementation - would normally query user service
    // For demo: VIP = 10%, Gold = 5%, Silver = 2%
    const tiers = {
      VIP: 10,
      Gold: 5,
      Silver: 2,
    };

    // Simulate tier check (in production, call User Service API)
    const customerTier = await this.getCustomerTier(customerId);

    if (customerTier && tiers[customerTier]) {
      return {
        tier_name: customerTier,
        discount_percentage: tiers[customerTier],
      };
    }

    return null;
  }

  /**
   * Get customer tier from User Service
   * In production, this would be an HTTP call to user-service
   */
  async getCustomerTier(customerId) {
    // Mock: Return tier based on customer ID for demo
    // In production: const response = await axios.get(`http://user-service:3001/api/users/${customerId}/tier`)

    const mockTiers = ["VIP", "Gold", "Silver", null];
    return mockTiers[customerId % 4];
  }

  /**
   * Create pricing rule
   */
  async createPricingRule(ruleData) {
    const {
      rule_name,
      rule_type,
      product_id,
      category_id,
      min_quantity,
      discount_percentage,
      valid_from,
      valid_until,
    } = ruleData;

    const query = `
      INSERT INTO pricing_rules 
        (rule_name, rule_type, product_id, category_id, min_quantity, 
         discount_percentage, valid_from, valid_until, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;

    const result = await db.query(query, [
      rule_name,
      rule_type,
      product_id || null,
      category_id || null,
      min_quantity || 1,
      discount_percentage,
      valid_from || null,
      valid_until || null,
    ]);

    logger.info(`Pricing rule created: ${rule_name}`);
    return result.rows[0];
  }

  /**
   * Get all active pricing rules
   */
  async getAllPricingRules(filters = {}) {
    let query = `
      SELECT pr.*, 
             p.name as product_name, 
             c.name as category_name
      FROM pricing_rules pr
      LEFT JOIN products p ON pr.product_id = p.id
      LEFT JOIN categories c ON pr.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.rule_type) {
      query += ` AND pr.rule_type = $${paramCount}`;
      params.push(filters.rule_type);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND pr.is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    query += " ORDER BY pr.created_at DESC";

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update pricing rule
   */
  async updatePricingRule(id, updateData) {
    const fields = [];
    const params = [];
    let paramCount = 1;

    const allowedFields = [
      "rule_name",
      "discount_percentage",
      "min_quantity",
      "valid_from",
      "valid_until",
      "is_active",
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        params.push(updateData[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE pricing_rules 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, params);
    logger.info(`Pricing rule updated: ID ${id}`);
    return result.rows[0];
  }

  /**
   * Calculate bundle pricing
   * For products sold as bundles with special pricing
   */
  async calculateBundlePrice(bundleItems) {
    try {
      let totalPrice = 0;
      let totalDiscount = 0;
      const itemDetails = [];

      for (const item of bundleItems) {
        const pricing = await this.calculatePrice(
          item.productId,
          item.quantity,
          item.customerId
        );

        totalPrice += pricing.subtotal;
        totalDiscount += pricing.totalDiscount;
        itemDetails.push(pricing);
      }

      // Apply bundle discount (e.g., 5% off when buying multiple items)
      const bundleDiscountPercentage = 5;
      const bundleDiscount =
        ((totalPrice - totalDiscount) * bundleDiscountPercentage) / 100;

      const finalTotal = totalPrice - totalDiscount - bundleDiscount;

      return {
        items: itemDetails,
        subtotal: parseFloat(totalPrice.toFixed(2)),
        itemDiscounts: parseFloat(totalDiscount.toFixed(2)),
        bundleDiscount: parseFloat(bundleDiscount.toFixed(2)),
        bundleDiscountPercentage,
        finalTotal: parseFloat(finalTotal.toFixed(2)),
        calculatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error calculating bundle price:", error);
      throw error;
    }
  }
}

module.exports = new PricingService();
