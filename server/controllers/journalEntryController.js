const { executeCommand } = require('../utils/cliExecutor');

/**
 * Create a new journal entry using the rollkit CLI
 */
const createJournalEntry = async (req, res) => {
  try {
    const { description, transactionsJson, user = 'bob' } = req.body;
    
    if (!description || !transactionsJson) {
      return res.status(400).json({
        success: false,
        message: 'Description and transactions are required'
      });
    }
    
    // Parse the JSON string to validate and potentially modify it
    let transactions;
    try {
      transactions = JSON.parse(transactionsJson);
      
      // Ensure amounts are numbers, not strings
      transactions = transactions.map(t => ({
        ...t,
        amount: parseInt(t.amount, 10)
      }));
      
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transactions format'
      });
    }
    
    // Convert back to JSON string and properly escape for shell
    const cleanTransactionsJson = JSON.stringify(transactions);
    
    // Use double quotes and escape internal quotes
    const escapedTransactionsJson = cleanTransactionsJson.replace(/"/g, '\\"');
    
    // Construct the CLI command with proper escaping
    const command = `rollkit tx ledger create-journal-entry "${description}" "${escapedTransactionsJson}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    console.log('Executing command:', command); // Debug log
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Journal entry created successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create journal entry: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

/**
 * Send tokens and record the transaction using the rollkit CLI
 */
const sendAndRecord = async (req, res) => {
  try {
    const { 
      toAddress, 
      amount, 
      denom = 'stake', 
      debitLedgerName, 
      creditLedgerName, 
      description, 
      user = 'bob' 
    } = req.body;
    
    if (!toAddress || !amount || !debitLedgerName || !creditLedgerName || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: toAddress, amount, debitLedgerName, creditLedgerName, description'
      });
    }
    
    // Construct the CLI command
    const command = `rollkit tx ledger send-and-record ${toAddress} ${amount} ${denom} "${debitLedgerName}" "${creditLedgerName}" "${description}" --from ${user} --chain-id erprollup -y --fees 5stake`;
    
    // Execute the command
    const result = await executeCommand(command);
    
    return res.status(200).json({
      success: true,
      message: 'Transaction completed successfully',
      data: result.stdout
    });
  } catch (error) {
    console.error('Error in send and record transaction:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to complete transaction: ${error.message}`,
      error: error.stderr || error.message
    });
  }
};

module.exports = {
  createJournalEntry,
  sendAndRecord
};