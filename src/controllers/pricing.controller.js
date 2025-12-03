const PricingService = require("../services/pricing.service");
const logger = require("../config/logger");

/**
 * Production-Grade Pricing Controller
 * Handles all pricing-related business logic endpoints
 */
class PricingController {
  /**
   * Calculate price for a product with all applicable discounts
   * POST /api/pricing/calculate
   */
  async calculatePrice(req, res) {
    try {
      const { productId, quantity = 1, customerId = null } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const pricing = await PricingService.calculatePrice(
        productId,
        quantity,
        customerId
      );

      res.json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      logger.error("Calculate price error:", error);
      res.status(500).json({
        success: false,
        message: "Error calculating price",
        error: error.message,
      });
    }
  }

  /**
   * Calculate bundle pricing
   * POST /api/pricing/calculate-bundle
   */
  async calculateBundlePrice(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Items array is required",
        });
      }

      const bundlePricing = await PricingService.calculateBundlePrice(items);

      res.json({
        success: true,
        data: bundlePricing,
      });
    } catch (error) {
      logger.error("Calculate bundle price error:", error);
      res.status(500).json({
        success: false,
        message: "Error calculating bundle price",
        error: error.message,
      });
    }
  }

  /**
   * Create pricing rule
   * POST /api/pricing/rules
   */
  async createPricingRule(req, res) {
    try {
      const ruleData = req.body;

      // Validate required fields
      if (
        !ruleData.rule_name ||
        !ruleData.rule_type ||
        !ruleData.discount_percentage
      ) {
        return res.status(400).json({
          success: false,
          message: "Rule name, type, and discount percentage are required",
        });
      }

      const rule = await PricingService.createPricingRule(ruleData);

      logger.info(`Pricing rule created: ${rule.rule_name}`);

      res.status(201).json({
        success: true,
        message: "Pricing rule created successfully",
        data: rule,
      });
    } catch (error) {
      logger.error("Create pricing rule error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating pricing rule",
        error: error.message,
      });
    }
  }

  /**
   * Get all pricing rules
   * GET /api/pricing/rules
   */
  async getAllPricingRules(req, res) {
    try {
      const { rule_type, is_active } = req.query;

      const filters = {};
      if (rule_type) filters.rule_type = rule_type;
      if (is_active !== undefined) filters.is_active = is_active === "true";

      const rules = await PricingService.getAllPricingRules(filters);

      res.json({
        success: true,
        count: rules.length,
        data: rules,
      });
    } catch (error) {
      logger.error("Get all pricing rules error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching pricing rules",
        error: error.message,
      });
    }
  }

  /**
   * Update pricing rule
   * PUT /api/pricing/rules/:id
   */
  async updatePricingRule(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedRule = await PricingService.updatePricingRule(
        id,
        updateData
      );

      if (!updatedRule) {
        return res.status(404).json({
          success: false,
          message: "Pricing rule not found",
        });
      }

      logger.info(`Pricing rule updated: ${updatedRule.rule_name}`);

      res.json({
        success: true,
        message: "Pricing rule updated successfully",
        data: updatedRule,
      });
    } catch (error) {
      logger.error("Update pricing rule error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating pricing rule",
        error: error.message,
      });
    }
  }

  /**
   * Get product price history (for analytics)
   * GET /api/pricing/history/:productId
   */
  async getPriceHistory(req, res) {
    try {
      const { productId } = req.params;
      const { days = 30 } = req.query;

      // This would track historical price changes
      // For now, return current pricing calculation
      const pricing = await PricingService.calculatePrice(productId, 1);

      res.json({
        success: true,
        data: {
          productId,
          currentPrice: pricing.pricePerUnit,
          basePrice: pricing.basePrice,
          history: [
            {
              date: new Date().toISOString(),
              price: pricing.pricePerUnit,
              basePrice: pricing.basePrice,
            },
          ],
          message:
            "Historical tracking will be implemented with time-series data",
        },
      });
    } catch (error) {
      logger.error("Get price history error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching price history",
        error: error.message,
      });
    }
  }

  /**
   * Simulate price comparison
   * POST /api/pricing/compare
   */
  async compareCompetitors(req, res) {
    try {
      const { productId, competitorPrices = [] } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const ourPricing = await PricingService.calculatePrice(productId, 1);

      // Calculate competitive positioning
      const comparison = {
        ourPrice: ourPricing.pricePerUnit,
        competitors: competitorPrices.map((cp) => ({
          competitor: cp.name,
          price: cp.price,
          difference: cp.price - ourPricing.pricePerUnit,
          percentageDiff: (
            ((cp.price - ourPricing.pricePerUnit) / cp.price) *
            100
          ).toFixed(2),
        })),
        positioning:
          competitorPrices.length > 0
            ? ourPricing.pricePerUnit <
              Math.min(...competitorPrices.map((cp) => cp.price))
              ? "lowest"
              : ourPricing.pricePerUnit >
                Math.max(...competitorPrices.map((cp) => cp.price))
              ? "premium"
              : "competitive"
            : "no_comparison",
      };

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      logger.error("Compare competitors error:", error);
      res.status(500).json({
        success: false,
        message: "Error comparing prices",
        error: error.message,
      });
    }
  }
}

module.exports = new PricingController();
