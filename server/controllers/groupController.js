const { executeCommand } = require('../utils/cliExecutor');

/**
 * Create a new account group using the rollkit CLI
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, groupType, user = 'bob' } = req.body;
    
    if (!name || !groupType) {
      return res.status(400).json({
        success: false,
        message: 'Group name and type are required'
      });
    }
    
    // Construct the CLI command
    // Example: rollkit tx ledger create-group "Capital Account" "Owner's capital" "Equity" --from bob --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx ledger create-group "${name}" "${description || ''}" "${groupType}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Group created successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create group: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  createGroup
};