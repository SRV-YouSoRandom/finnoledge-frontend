const { executeCommand } = require('../utils/cliExecutor');

/**
 * Define a new product using the rollkit CLI
 */
const defineProduct = async (req, res) => {
  try {
    const { name, description, unitOfMeasure, user = 'bob' } = req.body;
    
    if (!name || !description || !unitOfMeasure) {
      return res.status(400).json({
        success: false,
        message: 'Product name, description, and unit of measure are required'
      });
    }
    
    // Construct the CLI command
    // Example: rollkit tx inventory define-product "Widget A" "Standard Widget Model A" "Pieces" --from bob --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx inventory define-product "${name}" "${description}" "${unitOfMeasure}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Product defined successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error defining product:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to define product: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Record a stock movement using the rollkit CLI
 */
const recordStockMovement = async (req, res) => {
  try {
    const { 
      productName, 
      movementType, 
      quantity, 
      description, 
      reference, 
      user = 'bob' 
    } = req.body;
    
    if (!productName || !movementType || !quantity || !description || !reference) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: productName, movementType, quantity, description, reference'
      });
    }
    
    // Validate movement type
    const validMovementTypes = ['RECEIPT', 'ISSUE', 'ADJUST_POSITIVE', 'ADJUST_NEGATIVE'];
    if (!validMovementTypes.includes(movementType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid movement type. Must be one of: ${validMovementTypes.join(', ')}`
      });
    }
    
    // Construct the CLI command
    // Example: rollkit tx inventory record-stock-movement "Widget A" "RECEIPT" 100 "Initial stock receipt" "GRN-001" --from bob --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx inventory record-stock-movement "${productName}" "${movementType}" ${quantity} "${description}" "${reference}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error recording stock movement:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to record stock movement: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  defineProduct,
  recordStockMovement
};