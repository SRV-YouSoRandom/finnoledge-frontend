const { executeCommand } = require('../utils/cliExecutor');

/**
 * Create a new ledger account using the rollkit CLI
 */
const createLedger = async (req, res) => {
  try {
    const { 
      name, 
      groupName, 
      openingBalance = '0', 
      openingBalanceType = '', 
      user = 'bob' 
    } = req.body;
    
    if (!name || !groupName) {
      return res.status(400).json({
        success: false,
        message: 'Ledger name and group name are required'
      });
    }
    
    // Construct the CLI command
    // Example: rollkit tx ledger create-erp-ledger "Cash In Hand" "Current Assets" 10000 "Debit" --from bob --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx ledger create-erp-ledger "${name}" "${groupName}" ${openingBalance} "${openingBalanceType}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Ledger account created successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error creating ledger:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create ledger account: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  createLedger
};