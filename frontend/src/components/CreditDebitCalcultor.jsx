import { useState } from 'react';

const CreditDebitCalculator = () => {
  const [transactions, setTransactions] = useState([{ type: 'credit', amount: 0 }]);

  const handleTransactionChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setTransactions(updated);
  };

  const addTransaction = () => {
    setTransactions([...transactions, { type: 'credit', amount: 0 }]);
  };

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center text-blue-400">Credit & Debit Calculator</h2>

      {transactions.map((transaction, index) => (
        <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
          <select
            value={transaction.type}
            onChange={(e) => handleTransactionChange(index, 'type', e.target.value)}
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
          >
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input
            type="number"
            value={transaction.amount}
            onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
            className="p-2 bg-gray-800 text-white border border-gray-700 rounded"
            placeholder="Amount"
          />
        </div>
      ))}

      <button
        onClick={addTransaction}
        className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded text-white shadow"
      >
        + Add Transaction
      </button>

      <div className="bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-green-400 text-lg font-medium">Total Credit: ₹{totalCredit.toLocaleString('en-IN')}</p>
        <p className="text-red-400 text-lg font-medium">Total Debit: ₹{totalDebit.toLocaleString('en-IN')}</p>
        <p className="text-yellow-400 text-lg font-semibold mt-2">Net Balance: ₹{(totalCredit - totalDebit).toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default CreditDebitCalculator;
