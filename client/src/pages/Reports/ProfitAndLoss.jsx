import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Reports.css';

function ProfitAndLoss() {
  const [groups, setGroups] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    revenue: [],
    expenses: [],
    totals: {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0
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

        console.log('Fetched data:', {
          groups: fetchedGroups,
          ledgers: fetchedLedgers,
          journalEntries: fetchedJournalEntries
        });

        setGroups(fetchedGroups);
        setLedgers(fetchedLedgers);
        setJournalEntries(fetchedJournalEntries);

        // Calculate P&L data
        const calculatedData = calculatePnLData(fetchedGroups, fetchedLedgers, fetchedJournalEntries);
        setReportData(calculatedData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateLedgerBalance = (ledger, journalEntries, groupType) => {
    let balance = parseFloat(ledger.openingBalance) || 0;
    
    console.log(`Calculating balance for ledger: ${ledger.name}, opening balance: ${balance}, group type: ${groupType}`);
    
    // Calculate balance from journal entries
    journalEntries.forEach(entry => {
      if (entry.transactions) {
        let transactions;
        try {
          transactions = typeof entry.transactions === 'string' 
            ? JSON.parse(entry.transactions) 
            : entry.transactions;
        } catch (e) {
          console.error('Error parsing transactions:', e);
          return;
        }
        
        if (Array.isArray(transactions)) {
          transactions.forEach(transaction => {
            if (transaction.ledgerName === ledger.name) {
              const amount = parseFloat(transaction.amount) || 0;
              console.log(`Transaction for ${ledger.name}: ${transaction.entryType} ${amount}`);
              
              if (transaction.entryType === 'Debit') {
                if (groupType === 'Revenue') {
                  // Revenue accounts: Debit decreases balance
                  balance -= amount;
                } else if (groupType === 'Expense') {
                  // Expense accounts: Debit increases balance
                  balance += amount;
                }
              } else if (transaction.entryType === 'Credit') {
                if (groupType === 'Revenue') {
                  // Revenue accounts: Credit increases balance
                  balance += amount;
                } else if (groupType === 'Expense') {
                  // Expense accounts: Credit decreases balance
                  balance -= amount;
                }
              }
            }
          });
        }
      }
    });

    console.log(`Final balance for ${ledger.name}: ${balance}`);
    return balance;
  };

  const calculatePnLData = (groups, ledgers, journalEntries) => {
    const revenue = [];
    const expenses = [];
    let totalRevenue = 0;
    let totalExpenses = 0;

    console.log('Starting P&L calculation...');

    // Create a map of groups by name for easy lookup
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.name] = group;
    });

    // Group ledgers by their group names
    const ledgersByGroup = {};
    ledgers.forEach(ledger => {
      if (!ledgersByGroup[ledger.groupName]) {
        ledgersByGroup[ledger.groupName] = [];
      }
      ledgersByGroup[ledger.groupName].push(ledger);
    });

    console.log('Ledgers by group:', ledgersByGroup);

    // Process each group that has ledgers
    Object.keys(ledgersByGroup).forEach(groupName => {
      const group = groupMap[groupName];
      if (!group) {
        console.log(`Group ${groupName} not found in groups list`);
        return;
      }

      const groupLedgers = ledgersByGroup[groupName];
      let groupTotal = 0;

      const groupData = {
        groupName: group.name,
        groupType: group.groupType,
        ledgers: [],
        total: 0
      };

      groupLedgers.forEach(ledger => {
        const balance = calculateLedgerBalance(ledger, journalEntries, group.groupType);
        groupTotal += balance;

        groupData.ledgers.push({
          name: ledger.name,
          balance: balance
        });
      });

      groupData.total = groupTotal;

      console.log(`Group ${group.name} (${group.groupType}): total = ${groupTotal}`);

      // Categorize by group type (only Revenue and Expense for P&L)
      if (group.groupType === 'Revenue') {
        revenue.push(groupData);
        totalRevenue += groupTotal;
      } else if (group.groupType === 'Expense') {
        expenses.push(groupData);
        totalExpenses += Math.abs(groupTotal); // Use absolute value for expenses
      }
    });

    const netIncome = totalRevenue - totalExpenses;

    console.log('P&L Calculation Results:', {
      totalRevenue,
      totalExpenses,
      netIncome,
      revenue,
      expenses
    });

    return {
      revenue,
      expenses,
      totals: {
        totalRevenue,
        totalExpenses,
        netIncome
      }
    };
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">Loading profit and loss statement...</div>;
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">Profit and Loss Statement</h1>
        <p className="report-date">For the period ending {new Date().toLocaleDateString()}</p>
      </div>

      <div className="pnl-summary">
        <div className="report-section">
          <h2 className="report-section-title">REVENUE</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.revenue.length > 0 ? (
                <>
                  {reportData.revenue.map((group, index) => (
                    <React.Fragment key={index}>
                      <tr className="group-row">
                        <td><strong>{group.groupName}</strong></td>
                        <td className="amount"><strong>{formatAmount(group.total)}</strong></td>
                      </tr>
                      {group.ledgers.map((ledger, ledgerIndex) => (
                        <tr key={ledgerIndex} className="ledger-row">
                          <td style={{ paddingLeft: '20px' }}>{ledger.name}</td>
                          <td className="amount">{formatAmount(ledger.balance)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total Revenue</strong></td>
                    <td className="amount"><strong>{formatAmount(reportData.totals.totalRevenue)}</strong></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="2" className="empty-state">No revenue accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="report-section">
          <h2 className="report-section-title">EXPENSES</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.expenses.length > 0 ? (
                <>
                  {reportData.expenses.map((group, index) => (
                    <React.Fragment key={index}>
                      <tr className="group-row">
                        <td><strong>{group.groupName}</strong></td>
                        <td className="amount"><strong>{formatAmount(group.total)}</strong></td>
                      </tr>
                      {group.ledgers.map((ledger, ledgerIndex) => (
                        <tr key={ledgerIndex} className="ledger-row">
                          <td style={{ paddingLeft: '20px' }}>{ledger.name}</td>
                          <td className="amount">{formatAmount(Math.abs(ledger.balance))}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total Expenses</strong></td>
                    <td className="amount"><strong>{formatAmount(reportData.totals.totalExpenses)}</strong></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan="2" className="empty-state">No expense accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <table className="report-table">
          <tbody>
            <tr className="total-row">
              <td><strong>Total Revenue</strong></td>
              <td className="amount"><strong>{formatAmount(reportData.totals.totalRevenue)}</strong></td>
            </tr>
            <tr className="total-row">
              <td><strong>Total Expenses</strong></td>
              <td className="amount"><strong>({formatAmount(reportData.totals.totalExpenses)})</strong></td>
            </tr>
            <tr className="total-row" style={{ borderTop: '2px solid #000' }}>
              <td><strong>Net Income</strong></td>
              <td className="amount">
                <strong>
                  {reportData.totals.netIncome >= 0 ? '' : '('}
                  {formatAmount(reportData.totals.netIncome)}
                  {reportData.totals.netIncome >= 0 ? '' : ')'}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={`pnl-result ${reportData.totals.netIncome >= 0 ? 'profit' : 'loss'}`}>
        {reportData.totals.netIncome >= 0 
          ? `✓ Net Profit: ${formatAmount(reportData.totals.netIncome)}` 
          : `⚠ Net Loss: ${formatAmount(reportData.totals.netIncome)}`
        }
      </div>

      <div className="report-actions">
        <button onClick={handlePrint} className="print-button">
          Print Report
        </button>
      </div>
    </div>
  );
}

export default ProfitAndLoss;