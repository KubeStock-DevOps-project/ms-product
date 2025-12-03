const ProductLifecycleServiceClass = require("../services/productLifecycle.service");
const logger = require("../config/logger");

// Create instance
const ProductLifecycleService = new ProductLifecycleServiceClass();

// Define lifecycle states
const STATES = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  ACTIVE: "active",
  DISCONTINUED: "discontinued",
  ARCHIVED: "archived",
};

/**
 * Production-Grade Product Lifecycle Controller
 * Handles product lifecycle management endpoints
 */
class ProductLifecycleController {
  /**
   * Create product with lifecycle
   * POST /api/products/lifecycle
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const createdBy = req.body.created_by || 1; // In production, get from auth middleware

      if (!productData.name || !productData.category_id) {
        return res.status(400).json({
          success: false,
          message: "Product name and category are required",
        });
      }

      const product = await ProductLifecycleService.createProduct(
        productData,
        createdBy
      );

      logger.info(`Product created with lifecycle: ${product.sku}`);

      res.status(201).json({
        success: true,
        message: "Product created successfully in DRAFT state",
        data: product,
      });
    } catch (error) {
      logger.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message,
      });
    }
  }

  /**
   * Transition product state
   * POST /api/products/:id/transition
   */
  async transitionState(req, res) {
    try {
      const { id } = req.params;
      const { newState, notes } = req.body;
      const userId = req.body.userId || 1; // In production, get from auth middleware

      if (!newState) {
        return res.status(400).json({
          success: false,
          message: "New state is required",
        });
      }

      // Validate state value
      const validStates = Object.values(STATES);
      if (!validStates.includes(newState)) {
        return res.status(400).json({
          success: false,
          message: `Invalid state. Valid states are: ${validStates.join(", ")}`,
        });
      }

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        newState,
        userId,
        notes
      );

      logger.info(`Product ${id} transitioned to ${newState}`);

      res.json({
        success: true,
        message: `Product transitioned to ${newState} successfully`,
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Transition state error:", error);

      if (error.message.includes("Invalid state transition")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error transitioning product state",
        error: error.message,
      });
    }
  }

  /**
   * Get lifecycle history
   * GET /api/products/:id/lifecycle-history
   */
  async getLifecycleHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      const history = await ProductLifecycleService.getLifecycleHistory(
        id,
        parseInt(limit)
      );

      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      logger.error("Get lifecycle history error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching lifecycle history",
        error: error.message,
      });
    }
  }

  /**
   * Get products by state
   * GET /api/products/by-state/:state
   */
  async getProductsByState(req, res) {
    try {
      const { state } = req.params;
      const { category_id } = req.query;

      const filters = {};
      if (category_id) filters.category_id = parseInt(category_id);

      const products = await ProductLifecycleService.getProductsByState(
        state,
        filters
      );

      res.json({
        success: true,
        state,
        count: products.length,
        data: products,
      });
    } catch (error) {
      logger.error("Get products by state error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching products by state",
        error: error.message,
      });
    }
  }

  /**
   * Get pending approvals
   * GET /api/products/pending-approvals
   */
  async getPendingApprovals(req, res) {
    try {
      const pendingProducts =
        await ProductLifecycleService.getPendingApprovals();

      res.json({
        success: true,
        count: pendingProducts.length,
        data: pendingProducts,
      });
    } catch (error) {
      logger.error("Get pending approvals error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching pending approvals",
        error: error.message,
      });
    }
  }

  /**
   * Bulk approve products
   * POST /api/products/bulk-approve
   */
  async bulkApprove(req, res) {
    try {
      const { productIds, notes = "Bulk approval" } = req.body;
      const userId = req.body.userId || 1; // In production, get from auth middleware

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Product IDs array is required",
        });
      }

      const results = await ProductLifecycleService.bulkApprove(
        productIds,
        userId,
        notes
      );

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      logger.info(
        `Bulk approval: ${successCount} succeeded, ${failureCount} failed`
      );

      res.json({
        success: true,
        message: `Bulk approval completed: ${successCount} succeeded, ${failureCount} failed`,
        data: {
          successCount,
          failureCount,
          results,
        },
      });
    } catch (error) {
      logger.error("Bulk approve error:", error);
      res.status(500).json({
        success: false,
        message: "Error performing bulk approval",
        error: error.message,
      });
    }
  }

  /**
   * Submit product for approval
   * POST /api/products/:id/submit-for-approval
   */
  async submitForApproval(req, res) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 1;
      const notes = req.body.notes || "Submitted for approval";

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        STATES.PENDING_APPROVAL,
        userId,
        notes
      );

      logger.info(`Product ${id} submitted for approval`);

      res.json({
        success: true,
        message: "Product submitted for approval successfully",
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Submit for approval error:", error);
      res.status(500).json({
        success: false,
        message: "Error submitting product for approval",
        error: error.message,
      });
    }
  }

  /**
   * Approve product (shortcut for transition to approved)
   * POST /api/products/:id/approve
   */
  async approveProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 1;
      const notes = req.body.notes || "Approved";

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        STATES.APPROVED,
        userId,
        notes
      );

      logger.info(`Product ${id} approved`);

      res.json({
        success: true,
        message: "Product approved successfully",
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Approve product error:", error);
      res.status(500).json({
        success: false,
        message: "Error approving product",
        error: error.message,
      });
    }
  }

  /**
   * Activate product (make it available for sale)
   * POST /api/products/:id/activate
   */
  async activateProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 1;
      const notes = req.body.notes || "Activated for sale";

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        STATES.ACTIVE,
        userId,
        notes
      );

      logger.info(`Product ${id} activated`);

      res.json({
        success: true,
        message: "Product activated successfully and is now available for sale",
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Activate product error:", error);
      res.status(500).json({
        success: false,
        message: "Error activating product",
        error: error.message,
      });
    }
  }

  /**
   * Discontinue product
   * POST /api/products/:id/discontinue
   */
  async discontinueProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 1;
      const notes = req.body.notes || "Product discontinued";

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        STATES.DISCONTINUED,
        userId,
        notes
      );

      logger.info(`Product ${id} discontinued`);

      res.json({
        success: true,
        message: "Product discontinued successfully",
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Discontinue product error:", error);
      res.status(500).json({
        success: false,
        message: "Error discontinuing product",
        error: error.message,
      });
    }
  }

  /**
   * Archive product
   * POST /api/products/:id/archive
   */
  async archiveProduct(req, res) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 1;
      const notes = req.body.notes || "Product archived";

      const updatedProduct = await ProductLifecycleService.transitionState(
        id,
        STATES.ARCHIVED,
        userId,
        notes
      );

      logger.info(`Product ${id} archived`);

      res.json({
        success: true,
        message: "Product archived successfully",
        data: updatedProduct,
      });
    } catch (error) {
      logger.error("Archive product error:", error);
      res.status(500).json({
        success: false,
        message: "Error archiving product",
        error: error.message,
      });
    }
  }

  /**
   * Get lifecycle statistics
   * GET /api/products/lifecycle-stats
   */
  async getLifecycleStats(req, res) {
    try {
      // Get counts for each state
      const states = Object.values(STATES);
      const stats = {};

      for (const state of states) {
        const products = await ProductLifecycleService.getProductsByState(
          state
        );
        stats[state] = products.length;
      }

      stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Get lifecycle stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching lifecycle statistics",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductLifecycleController();
