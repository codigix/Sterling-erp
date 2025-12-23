import { useState } from 'react';
import { Search, Filter, Download, CheckCircle, AlertCircle } from 'lucide-react';

const BankReconciliationPage = () => {
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [reconciliationStatus, setReconciliationStatus] = useState('pending');

  const bankAccounts = [
    { id: 'hdfc', name: 'HDFC Bank', balance: 5000000, statement: 5050000, lastReconciled: '2025-12-15' },
    { id: 'icici', name: 'ICICI Bank', balance: 3200000, statement: 3180000, lastReconciled: '2025-12-14' },
  ];

  const selectedAccountData = bankAccounts.find(b => b.id === selectedBank);

  const deposits = [
    { id: 1, date: '2025-12-20', description: 'Deposit from Client A', amount: 350000, status: 'cleared' },
    { id: 2, date: '2025-12-19', description: 'Deposit from Client B', amount: 260000, status: 'cleared' },
    { id: 3, date: '2025-12-18', description: 'Deposit from Returned Cheque', amount: 125000, status: 'pending' },
  ];

  const withdrawals = [
    { id: 1, date: '2025-12-20', description: 'Cheque #1001', amount: 150000, status: 'cleared' },
    { id: 2, date: '2025-12-19', description: 'Cheque #1002', amount: 280000, status: 'cleared' },
    { id: 3, date: '2025-12-18', description: 'Cheque #1003', amount: 95000, status: 'pending' },
    { id: 4, date: '2025-12-17', description: 'NEFT Payment', amount: 125000, status: 'pending' },
  ];

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const bookBalance = selectedAccountData.balance;
  const statementBalance = selectedAccountData.statement;
  const difference = Math.abs(bookBalance - statementBalance);

  const isReconciled = difference === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bank Reconciliation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Reconcile bank statements with book records</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Bank Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedBank(account.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedBank === account.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-slate-900 dark:text-white">{account.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Balance: ₹{account.balance.toLocaleString('en-IN')}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Book Balance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{bookBalance.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">As per accounting records</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Statement Balance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{statementBalance.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">As per bank statement</p>
            </div>
          </div>

          {isReconciled ? (
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-6 flex items-center text-xs gap-4">
              <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900 dark:text-green-100">Reconciliation Complete</p>
                <p className="text-sm text-green-800 dark:text-green-200">Book balance matches bank statement</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 flex items-center text-xs gap-4">
              <AlertCircle size={32} className="text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-yellow-900 dark:text-yellow-100">Difference: ₹{difference.toLocaleString('en-IN')}</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Book balance and statement balance do not match. Check outstanding items below.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Reconciliation Summary</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Book Balance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{bookBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Add: Deposits in Transit</p>
              <p className="text-lg font-bold text-green-600">+₹{deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Less: Cheques Outstanding</p>
              <p className="text-lg font-bold text-red-600">-₹{withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Adjusted Balance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{(bookBalance + deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0) - withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0)).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Deposits (Credits)</h3>
          <div className="space-y-3">
            {deposits.map((deposit) => (
              <div key={deposit.id} className="flex items-center text-xs justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{deposit.description}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{deposit.date}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-green-600">+₹{deposit.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                    deposit.status === 'cleared'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {deposit.status === 'cleared' ? 'Cleared' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Withdrawals (Debits)</h3>
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center text-xs justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{withdrawal.description}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{withdrawal.date}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-red-600">-₹{withdrawal.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                    withdrawal.status === 'cleared'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {withdrawal.status === 'cleared' ? 'Cleared' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankReconciliationPage;
