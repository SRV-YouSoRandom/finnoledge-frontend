// server/controllers/validatorController.js
const { executeCommand } = require('../utils/cliExecutor');

/**
 * Setup or update validator tracking information
 */
const setupValidatorTracking = async (req, res) => {
  try {
    const { validatorAddress, apiUrl, delegationStr, user = 'bob' } = req.body;
    
    if (!validatorAddress) {
      return res.status(400).json({
        success: false,
        message: 'Validator address is required'
      });
    }
    
    // Construct the CLI command
    // rollkit tx validator setup-validator-tracking "validatorAddress" "apiUrl" "delegationStr" --from user --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx validator setup-validator-tracking "${validatorAddress}" "${apiUrl || ''}" "${delegationStr || ''}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Validator tracking setup successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error setting up validator tracking:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to setup validator tracking: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Record manual earnings for a validator
 */
const recordManualEarnings = async (req, res) => {
  try {
    const { amount, description, user = 'bob' } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }
    
    // Validate amount
    const earningsAmount = parseInt(amount);
    if (isNaN(earningsAmount) || earningsAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number'
      });
    }
    
    // Construct the CLI command
    const command = `rollkit tx validator record-manual-earnings ${earningsAmount} "${description}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Manual earnings recorded successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error recording manual earnings:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to record manual earnings: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Record expenditure for a validator
 */
const recordExpenditure = async (req, res) => {
  try {
    const { amount, description, user = 'bob' } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }
    
    // Validate amount
    const expenditureAmount = parseInt(amount);
    if (isNaN(expenditureAmount) || expenditureAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number'
      });
    }
    
    // Construct the CLI command
    const command = `rollkit tx validator record-expenditure ${expenditureAmount} "${description}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command);
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Expenditure recorded successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error recording expenditure:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to record expenditure: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  setupValidatorTracking,
  recordManualEarnings,
  recordExpenditure
};