import { useState } from "react";
import SidebarCalculator from "./sidebar";
import SIPCalculator from "./SIPCalculator";
import GstCalculator from "./gst";
import TaxCalc from "./TaxCalculator";
import './index.css';
// import other calculators similarly

export default function Calculators() {
  const [selectedCalc, setSelectedCalc] = useState("SIP Calculator");

  const renderCalculator = () => {
    switch (selectedCalc) {
      case "SIP Calculator":
        return <SIPCalculator />;
      case "Income Tax Calculator":
        return <TaxCalc />;
      case "GST Calculator":
        return <GstCalculator />;
      default:
        return (
          <div className="text-gray-400 text-xl mt-8">
            🚧 Coming soon...
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <SidebarCalculator onSelect={setSelectedCalc} />
      <div className="flex-1 p-8 overflow-y-auto">{renderCalculator()}</div>
    </div>
  );
}
