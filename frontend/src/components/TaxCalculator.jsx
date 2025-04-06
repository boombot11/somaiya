import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ageCategories = ['Below 60', '60 to 80', '80 or Above 80'];
const assessmentYears = ['2024 - 2025', '2023 - 2024', '2022 - 2023'];
const COLORS = ['#4F46E5', '#22C55E', '#F59E0B', '#EC4899'];

const TaxCalc = () => {
  const [ageCategory, setAgeCategory] = useState(ageCategories[0]);
  const [assessmentYear, setAssessmentYear] = useState(assessmentYears[0]);
  const [income, setIncome] = useState({ salary: 0, other: 0, interest: 0, rent: 0 });
  const [deductions, setDeductions] = useState({
    sec80C: 0,
    sec80CCD1B: 0,
    sec80D: 0,
    sec80G: 0,
    sec80E: 0,
    sec80TTA: 0
  });
  const [hraExemption, setHraExemption] = useState(0);
  const [tax, setTax] = useState(null);
  const [donutData, setDonutData] = useState([]);

  const handleIncomeChange = (field, value) => setIncome({ ...income, [field]: parseFloat(value) || 0 });
  const handleDeductionChange = (field, value) => setDeductions({ ...deductions, [field]: parseFloat(value) || 0 });

  const getExemptionLimit = () => {
    if (ageCategory === 'Below 60') return 250000;
    if (ageCategory === '60 to 80') return 300000;
    return 500000;
  };

  const handleCalculate = () => {
    const grossIncome = income.salary + income.other + income.interest + income.rent;
    const totalDeductions =
      Math.min(deductions.sec80C, 150000) +
      Math.min(deductions.sec80CCD1B, 50000) +
      Math.min(deductions.sec80D, 25000) +
      deductions.sec80G +
      deductions.sec80E +
      Math.min(deductions.sec80TTA, 10000) +
      hraExemption;

    const taxableIncome = Math.max(grossIncome - totalDeductions, 0);
    const exemptionLimit = getExemptionLimit();
    let totalTax = 0;

    if (taxableIncome <= exemptionLimit) {
      totalTax = 0;
    } else if (taxableIncome <= 500000) {
      totalTax = (taxableIncome - exemptionLimit) * 0.05;
    } else if (taxableIncome <= 1000000) {
      totalTax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      totalTax = 112500 + (taxableIncome - 1000000) * 0.3;
    }

    setTax(totalTax);

    const donut = [
      { name: 'Gross Income', value: grossIncome },
      { name: 'Total Deductions', value: totalDeductions },
      { name: 'Taxable Income', value: taxableIncome },
      { name: 'Estimated Tax', value: totalTax },
    ];
    setDonutData(donut);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white shadow-lg rounded-2xl space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-400">Income Tax Calculator</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-300">Assessment Year</label>
          <select className="p-2 border border-gray-700 rounded w-full bg-gray-800 text-white" value={assessmentYear} onChange={(e) => setAssessmentYear(e.target.value)}>
            {assessmentYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-300">Age Category</label>
          <select className="p-2 border border-gray-700 rounded w-full bg-gray-800 text-white" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}>
            {ageCategories.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-blue-400 mt-4 mb-2">Income</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['salary', 'other', 'interest', 'rent'].map((field) => (
            <div key={field}>
              <label className="capitalize block mb-1 font-medium text-gray-300">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input type="number" className="p-2 border border-gray-700 bg-gray-800 text-white rounded w-full" onChange={(e) => handleIncomeChange(field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-blue-400 mt-6 mb-2">Deductions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(deductions).map((field) => (
            <div key={field}>
              <label className="capitalize block mb-1 font-medium text-gray-300">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input type="number" className="p-2 border border-gray-700 bg-gray-800 text-white rounded w-full" onChange={(e) => handleDeductionChange(field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-300">HRA Exemption</label>
        <input type="number" className="p-2 border border-gray-700 bg-gray-800 text-white rounded w-full" onChange={(e) => setHraExemption(parseFloat(e.target.value) || 0)} />
      </div>

      <div className="flex justify-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition" onClick={handleCalculate}>
          Calculate Tax
        </button>
      </div>

      {tax !== null && (
        <div className="text-center bg-green-800 text-green-200 p-4 rounded shadow">
          <p className="text-xl font-bold">Estimated Tax: ₹{tax.toLocaleString('en-IN')}</p>
        </div>
      )}

      {donutData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-center text-blue-400 mb-4">Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name }) => name}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TaxCalc;
