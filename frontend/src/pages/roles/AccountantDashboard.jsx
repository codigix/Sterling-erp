import { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboardLayout from '../../components/layout/RoleDashboardLayout';
import FinancialOverviewPage from '../accountant/FinancialOverviewPage';
import VendorInvoicesPage from '../accountant/VendorInvoicesPage';
import BillPaymentsPage from '../accountant/BillPaymentsPage';
import CustomerInvoicesPage from '../accountant/CustomerInvoicesPage';
import PaymentTrackingPage from '../accountant/PaymentTrackingPage';
import GeneralLedgerPage from '../accountant/GeneralLedgerPage';
import ChartOfAccountsPage from '../accountant/ChartOfAccountsPage';
import IncomeStatementPage from '../accountant/IncomeStatementPage';
import BalanceSheetPage from '../accountant/BalanceSheetPage';
import BankReconciliationPage from '../accountant/BankReconciliationPage';
import BudgetManagementPage from '../accountant/BudgetManagementPage';
import ExpenseTrackingPage from '../accountant/ExpenseTrackingPage';
import {
  BarChart3,
  Coins,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  PieChart,
  AlertTriangle,
} from 'lucide-react';

const DashboardContent = ({
  stats,
  dateRange,
  setDateRange,
  handleExport,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor financial performance and transactions</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <TrendingUp size={18} />
          Export Report
        </button>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
        >
          <option value="current-month">Current Month</option>
          <option value="last-quarter">Last Quarter</option>
          <option value="last-year">Last Year</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
              <Icon size={32} className={`${stat.positive ? 'text-green-600' : 'text-red-600'} opacity-20`} />
            </div>
          </div>
        );
      })}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/accountant/payable/vendor-invoices"
            className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Coins size={24} className="text-blue-600 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Vendor Invoices</p>
          </Link>
          <Link
            to="/accountant/receivable/customer-invoices"
            className="p-4 bg-green-50 dark:bg-slate-700 rounded-lg hover:bg-green-100 dark:hover:bg-slate-600 transition-colors"
          >
            <Coins size={24} className="text-green-600 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Customer Invoices</p>
          </Link>
          <Link
            to="/accountant/reports/income-statement"
            className="p-4 bg-purple-50 dark:bg-slate-700 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors"
          >
            <FileText size={24} className="text-purple-600 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Income Statement</p>
          </Link>
          <Link
            to="/accountant/budget/management"
            className="p-4 bg-orange-50 dark:bg-slate-700 rounded-lg hover:bg-orange-100 dark:hover:bg-slate-600 transition-colors"
          >
            <PieChart size={24} className="text-orange-600 mb-2" />
            <p className="font-medium text-slate-900 dark:text-white">Budget</p>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Alerts</h2>
        <div className="space-y-3">
          <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200 text-sm">Outstanding Bills</p>
              <p className="text-xs text-red-700 dark:text-red-300">5 bills pending payment</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200 text-sm">Overdue Invoices</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">3 invoices overdue</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200 text-sm">Budget Alert</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Travel budget at 85%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AccountantDashboard = () => {
  const [dateRange, setDateRange] = useState('current-month');

  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/accountant/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Accounts Payable',
      icon: CreditCard,
      submenu: [
        { title: 'Vendor Invoices', path: '/accountant/payable/vendor-invoices', icon: FileText },
        { title: 'Bill Payments', path: '/accountant/payable/bill-payments', icon: CreditCard },
      ]
    },
    {
      title: 'Accounts Receivable',
      icon: Coins,
      submenu: [
        { title: 'Customer Invoices', path: '/accountant/receivable/customer-invoices', icon: FileText },
        { title: 'Payment Tracking', path: '/accountant/receivable/payment-tracking', icon: TrendingUp },
      ]
    },
    {
      title: 'General Ledger',
      icon: FileText,
      submenu: [
        { title: 'Ledger Entries', path: '/accountant/ledger/entries', icon: FileText },
        { title: 'Chart of Accounts', path: '/accountant/ledger/chart-of-accounts', icon: BarChart3 },
      ]
    },
    {
      title: 'Financial Reports',
      icon: BarChart3,
      submenu: [
        { title: 'Income Statement', path: '/accountant/reports/income-statement', icon: TrendingUp },
        { title: 'Balance Sheet', path: '/accountant/reports/balance-sheet', icon: BarChart3 },
      ]
    },
    {
      title: 'Bank Reconciliation',
      path: '/accountant/bank/reconciliation',
      icon: Banknote,
    },
    {
      title: 'Budget Management',
      path: '/accountant/budget/management',
      icon: PieChart,
    },
    {
      title: 'Expense Tracking',
      path: '/accountant/expense/tracking',
      icon: Coins,
    },
  ];

  const stats = [
    {
      title: 'Total Receivable',
      value: '₹45,32,500',
      change: '+5.2%',
      positive: true,
      icon: Coins,
    },
    {
      title: 'Total Payable',
      value: '₹22,15,000',
      change: '+2.1%',
      positive: false,
      icon: CreditCard,
    },
    {
      title: 'Current Cash',
      value: '₹18,50,000',
      change: '+8.5%',
      positive: true,
      icon: Coins,
    },
    {
      title: 'Monthly Revenue',
      value: '₹95,43,000',
      change: '+12.3%',
      positive: true,
      icon: TrendingUp,
    },
  ];

  const handleExport = () => {
    alert('Exporting financial report...');
  };

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Accountant"
      roleIcon={BarChart3}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={
            <DashboardContent
              stats={stats}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleExport={handleExport}
            />
          }
        />
        <Route path="/payable/vendor-invoices" element={<VendorInvoicesPage />} />
        <Route path="/payable/bill-payments" element={<BillPaymentsPage />} />
        <Route path="/receivable/customer-invoices" element={<CustomerInvoicesPage />} />
        <Route path="/receivable/payment-tracking" element={<PaymentTrackingPage />} />
        <Route path="/ledger/entries" element={<GeneralLedgerPage />} />
        <Route path="/ledger/chart-of-accounts" element={<ChartOfAccountsPage />} />
        <Route path="/reports/income-statement" element={<IncomeStatementPage />} />
        <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/bank/reconciliation" element={<BankReconciliationPage />} />
        <Route path="/budget/management" element={<BudgetManagementPage />} />
        <Route path="/expense/tracking" element={<ExpenseTrackingPage />} />
        <Route path="/" element={<Navigate to="/accountant/dashboard" replace />} />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default AccountantDashboard;
