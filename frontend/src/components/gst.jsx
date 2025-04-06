import { useState } from 'react';

export default function GstCalculator() {
  const [amount, setAmount] = useState(25000);
  const [gstRate, setGstRate] = useState(12);
  const [isExcluding, setIsExcluding] = useState(true);

  const gst = isExcluding
    ? (amount * gstRate) / 100
    : (amount * gstRate) / (100 + gstRate);

  const postGstAmount = isExcluding
    ? amount + gst
    : amount;

  const preGstAmount = isExcluding
    ? amount
    : amount - gst;

  return (
    <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">GST Calculator</h1>

      <div className="flex gap-6 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={isExcluding}
            onChange={() => setIsExcluding(true)}
            className="accent-blue-500"
          />
          <span>Excluding GST</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={!isExcluding}
            onChange={() => setIsExcluding(false)}
            className="accent-blue-500"
          />
          <span>Including GST</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value || 0))}
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1">Tax Slab (%)</label>
        <select
          value={gstRate}
          onChange={(e) => setGstRate(parseFloat(e.target.value))}
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 12, 18, 28].map((rate) => (
            <option key={rate} value={rate}>{rate}%</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 text-gray-300 font-medium">
        <div className="flex justify-between">
          <span>GST Amount:</span>
          <span>₹{gst.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Pre-GST Amount:</span>
          <span>₹{preGstAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-blue-400 font-bold text-lg">
          <span>Final Amount:</span>
          <span>₹{postGstAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
