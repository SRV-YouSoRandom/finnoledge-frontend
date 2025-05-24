import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Reports.css';

function BalanceSheet() {
  const [groups, setGroups] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    assets: [],
    liabilities: [],
    equity: [],
    totals: {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [groupsResponse, ledgersResponse, journalEntriesResponse] = await Promise.all([
          api.fetchGroups(),
          api.fetchLedgers(),
          api.fetchJournalEntries()
        ]);

        const fetchedGroups = groupsResponse.data.Group || [];
        const fetchedLedgers = ledgersResponse.data.ErpLedger || [];
        const fetchedJournalEntries = journalEntriesResponse.data.JournalEntry || [];

        setGroups(fetchedGroups);
        setLedgers(fetchedLedgers);
        setJournalEntries(fetchedJournalEntries);

        // Calculate balances and prepare report data
        const calculatedData = calculateBalanceSheetData(fetchedGroups, fetchedLedgers, fetchedJournalEntries);
        setReportData(calculatedData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateLedgerBalance = (ledger, journalEntries) => {
    // Start with opening balance
    let balance = parseFloat(ledger.openingBalance) || 0;
    
    // Determine the normal balance side for this account type
    const normalDebitAccounts = ['Asset', 'Expense'];
    const normalCreditAccounts = ['Liability', 'Equity', 'Revenue'];
    
    // If opening balance type is specified, apply it correctly
    if (ledger.openingBalanceType) {
      if (ledger.openingBalanceType === 'Credit' && normalDebitAccounts.includes(ledger.groupType)) {
        balance = -balance; // Credit opening balance for normally debit account
      } else if (ledger.openingBalanceType === 'Debit' && normalCreditAccounts.includes(ledger.groupType)) {
        balance = -balance; // Debit opening balance for normally credit account
      }
    } else {
      // If no opening balance type specified, assume normal balance for the account type
      if (normalCreditAccounts.includes(ledger.groupType)) {
        balance = -balance; // Treat as credit balance for liability/equity accounts
      }
    }
    
    // Calculate balance from journal entries
    journalEntries.forEach(entry => {
      if (entry.transactions) {
        const transactions = typeof entry.transactions === 'string' 
          ? JSON.parse(entry.transactions) 
          : entry.transactions;
        
        transactions.forEach(transaction => {
          if (transaction.ledgerName === ledger.name) {
            const amount = parseFloat(transaction.amount) || 0;
            
            if (transaction.entryType === 'Debit') {
              balance += amount; // Debit always increases the balance
            } else if (transaction.entryType === 'Credit') {
              balance -= amount; // Credit always decreases the balance
            }
          }
        });
      }
    });

    // For balance sheet presentation, we need the absolute value
    // but we need to know if this account has a normal balance
    const hasNormalBalance = normalDebitAccounts.includes(ledger.groupType) 
      ? balance >= 0 
      : balance <= 0;
    
    // Return the balance for balance sheet (always positive for presentation)
    // If account doesn't have normal balance, it might need special handling
    return hasNormalBalance ? Math.abs(balance) : Math.abs(balance);
  };

  const calculateBalanceSheetData = (groups, ledgers, journalEntries) => {
    const assets = [];
    const liabilities = [];
    const equity = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    // Group ledgers by their group names
    const ledgersByGroup = {};
    ledgers.forEach(ledger => {
      // Find the group to get the group type
      const group = groups.find(g => g.name === ledger.groupName);
      if (group) {
        ledger.groupType = group.groupType; // Ensure ledger has group type
        if (!ledgersByGroup[ledger.groupName]) {
          ledgersByGroup[ledger.groupName] = [];
        }
        ledgersByGroup[ledger.groupName].push(ledger);
      }
    });

    // Process each group
    groups.forEach(group => {
      const groupLedgers = ledgersByGroup[group.name] || [];
      let groupTotal = 0;

      const groupData = {
        groupName: group.name,
        groupType: group.groupType,
        ledgers: [],
        total: 0
      };

      groupLedgers.forEach(ledger => {
        const balance = calculateLedgerBalance(ledger, journalEntries);
        
        // Only include ledgers with non-zero balances in balance sheet
        if (balance !== 0) {
          groupTotal += balance;
          groupData.ledgers.push({
            name: ledger.name,
            balance: balance
          });
        }
      });

      // Only include groups with non-zero totals
      if (groupTotal !== 0) {
        groupData.total = groupTotal;

        // Categorize by group type
        if (group.groupType === 'Asset') {
          assets.push(groupData);
          totalAssets += groupTotal;
        } else if (group.groupType === 'Liability') {
          liabilities.push(groupData);
          totalLiabilities += groupTotal;
        } else if (group.groupType === 'Equity') {
          equity.push(groupData);
          totalEquity += groupTotal;
        }
      }
    });

    return {
      assets,
      liabilities,
      equity,
      totals: {
        totalAssets,
        totalLiabilities,
        totalEquity
      }
    };
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount); // Remove Math.abs() - amount should already be positive
  };

  const balanceDifference = reportData.totals.totalAssets - (reportData.totals.totalLiabilities + reportData.totals.totalEquity);
  const isBalanced = Math.abs(balanceDifference) < 0.01;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading balance sheet...</div>;
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">Balance Sheet</h1>
        <p className="report-date">As of {new Date().toLocaleDateString()}</p>
      </div>

      <div className="balance-sheet-section">
        <div className="report-section">
          <h2 className="report-section-title">ASSETS</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.assets.map((group, index) => (
                <React.Fragment key={index}>
                  <tr className="group-row">
                    <td><strong>{group.groupName}</strong></td>
                    <td className="amount"><strong>{formatAmount(group.total)}</strong></td>
                  </tr>
                  {group.ledgers.map((ledger, ledgerIndex) => (
                    <tr key={ledgerIndex} className="ledger-row">
                      <td className="ledger-indent">{ledger.name}</td>
                      <td className="amount">{formatAmount(ledger.balance)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr className="total-row">
                <td><strong>Total Assets</strong></td>
                <td className="amount"><strong>{formatAmount(reportData.totals.totalAssets)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2 className="report-section-title">LIABILITIES</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.liabilities.map((group, index) => (
                <React.Fragment key={index}>
                  <tr className="group-row">
                    <td><strong>{group.groupName}</strong></td>
                    <td className="amount"><strong>{formatAmount(group.total)}</strong></td>
                  </tr>
                  {group.ledgers.map((ledger, ledgerIndex) => (
                    <tr key={ledgerIndex} className="ledger-row">
                      <td className="ledger-indent">{ledger.name}</td>
                      <td className="amount">{formatAmount(ledger.balance)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr className="total-row">
                <td><strong>Total Liabilities</strong></td>
                <td className="amount"><strong>{formatAmount(reportData.totals.totalLiabilities)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2 className="report-section-title">EQUITY</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.equity.map((group, index) => (
                <React.Fragment key={index}>
                  <tr className="group-row">
                    <td><strong>{group.groupName}</strong></td>
                    <td className="amount"><strong>{formatAmount(group.total)}</strong></td>
                  </tr>
                  {group.ledgers.map((ledger, ledgerIndex) => (
                    <tr key={ledgerIndex} className="ledger-row">
                      <td className="ledger-indent">{ledger.name}</td>
                      <td className="amount">{formatAmount(ledger.balance)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr className="total-row">
                <td><strong>Total Equity</strong></td>
                <td className="amount"><strong>{formatAmount(reportData.totals.totalEquity)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <table className="report-table">
            <tbody>
              <tr className="total-row">
                <td><strong>Total Liabilities and Equity</strong></td>
                <td className="amount">
                  <strong>{formatAmount(reportData.totals.totalLiabilities + reportData.totals.totalEquity)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={`balance-verification ${isBalanced ? 'balanced' : 'unbalanced'}`}>
          {isBalanced 
            ? '✓ Balance Sheet is balanced' 
            : `⚠ Balance Sheet is not balanced (Difference: ${formatAmount(Math.abs(balanceDifference))})`
          }
        </div>
      </div>

      <div className="report-actions">
        <button onClick={handlePrint} className="print-button">
          Print Report
        </button>
      </div>
    </div>
  );
}

export default BalanceSheet;