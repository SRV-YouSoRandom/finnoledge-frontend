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
    
    // Construct the CLI command
    // Example: rollkit tx ledger create-journal-entry "Cash withdrawal" '[{"ledgerName":"Cash", "entryType":"Debit", "amount":500}]' --from bob --chain-id erprollup -y --fees 5stake
    const command = `rollkit tx ledger create-journal-entry "${description}" '${transactionsJson}' --from ${user} --chain-id erprollup -y --fees 5stake`;
    
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
    // Example: rollkit tx ledger send-and-record erp1... 1000 stake "Salaries Expense" "Bank Account - XYZ" "Monthly salary payment" --from bob --chain-id erprollup -y --fees 5stake
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