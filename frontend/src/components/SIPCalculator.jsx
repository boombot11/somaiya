import { useState } from "react";
import DonutChart from "./DonutChart";

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(4625);
  const [expectedRate, setExpectedRate] = useState(6);
  const [years, setYears] = useState(17);

  const { futureValue, investedAmount, returns } = calculateSIP(monthlyInvestment, expectedRate, years);

  return (
    <div className="bg-[#121212] text-white p-6 rounded-xl w-full max-w-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">SIP Calculator</h2>

      <div className="space-y-6">
        {/* Monthly Investment */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Monthly Investment</label>
          <input
            type="range"
            min="500"
            max="100000"
            step="100"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(+e.target.value)}
            className="w-full accent-blue-400"
          />
          <p className="text-sm text-blue-300 mt-1">₹{monthlyInvestment.toLocaleString()}</p>
        </div>

        {/* Expected Return Rate */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Expected Return Rate (p.a)</label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={expectedRate}
            onChange={(e) => setExpectedRate(+e.target.value)}
            className="w-full accent-blue-400"
          />
          <p className="text-sm text-blue-300 mt-1">{expectedRate}%</p>
        </div>

        {/* Time Period */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Time Period</label>
          <input
            type="range"
            min="1"
            max="30"
            value={years}
            onChange={(e) => setYears(+e.target.value)}
            className="w-full accent-blue-400"
          />
          <p className="text-sm text-blue-300 mt-1">{years} Years</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="mt-8 flex justify-center">
        <DonutChart invested={investedAmount} returns={returns} />
      </div>

      {/* Results */}
      <div className="mt-8 text-sm space-y-2 bg-gray-900 p-4 rounded-lg">
        <p>Invested Amount: <span className="text-blue-300 font-medium">₹{investedAmount.toLocaleString()}</span></p>
        <p>Estimated Returns: <span className="text-green-400 font-medium">₹{returns.toLocaleString()}</span></p>
        <p className="text-lg font-semibold text-white">
          Total Value: <span className="text-yellow-400">₹{futureValue.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}

function calculateSIP(P, annualRate, years) {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const FV = P * (((Math.pow(1 + r, n) - 1) * (1 + r)) / r);
  const invested = P * n;
  const returns = FV - invested;
  return { futureValue: FV, investedAmount: invested, returns };
}
