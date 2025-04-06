export default function SidebarCalculator({ onSelect }) {
  const calculators = [
    "SIP Calculator",
    "Income Tax Calculator",
    "GST Calculator",
    "Lumpsum Calculator",
    "SWP Calculator",
    "Mutual Fund Returns Calculator",
    "Sukanya Samriddhi Yojana Calculator",
    "PPF Calculator",
    "EPF Calculator",
    ];

  return (
    <div className="bg-black bg-opacity-80 backdrop-blur text-white p-6 w-64 min-h-screen rounded-r-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-blue-400">Popular Calculators</h3>
      <div className="space-y-2">
        {calculators.map((item, idx) => (
          <button
            key={idx}
            className="w-full text-left px-4 py-2 bg-gray-800/60 rounded-lg hover:bg-blue-600 hover:text-white transition duration-200"
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
