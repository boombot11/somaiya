import { useState, useRef } from "react";
import "./App.css";
import DocumentCategory from "./DocumentCategory";
import { allDocuments } from "./documentTitles";
import { ChevronDown } from "lucide-react";

// Filter keyword lists
const form_16_docs = [
  "PAN Card – Mandatory for filing ITR and for TDS.",
  "Aadhaar Card",
  "Bank Account Details",
  "Form 16 (Part A & B)",
  "Form 12BB",
  "Salary Slips",
  "Form 26AS / AIS",
  "Interest Certificate (Savings/FD)"
];

const itr_1_docs = [
  "PAN Card",
  "Aadhaar Card",
  "Bank Account Details",
  "Form 16",
  "Form 26AS / AIS",
  "Salary Slips",
  "House Property Details (Address, Ownership)",
  "Loan Interest Certificate (if applicable)",
  "Rent Receipts / Rent Agreement (if HRA claimed)",
  "Medical Insurance Premium Receipts (Section 80D)",
  "Investment Proofs (Section 80C, like PPF, ELSS)",
  "Donation Receipts (Section 80G)",
  "Interest Certificates (Savings, FD)"
];

function shouldInclude(docTitle, filterList = []) {
  return filterList.some(keyword => docTitle.includes(keyword));
}

function TaxManager() {
  const [filter, setFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleSelect = (value) => {
    setFilter(value);
    setShowDropdown(false);
  };

  const getFilterList = () => {
    if (filter === "form_16") return form_16_docs;
    if (filter === "itr_1") return itr_1_docs;
    return null;
  };

  const filterList = getFilterList();

  // Filter and group by category
  const groupedDocs = {};
  for (const doc of allDocuments) {
    const shouldShow = !filterList || shouldInclude(doc.title, filterList);
    if (!shouldShow) continue;

    if (!groupedDocs[doc.category]) groupedDocs[doc.category] = [];
    groupedDocs[doc.category].push({
      title: doc.title,
      uploadedAt: null,
      isUploaded: false
    });
  }

  return (
    <div className="bg-zinc-950 text-white w-full min-h-screen p-6 overflow-auto">
      {/* Header and Filter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tax Document Manager</h1>

        <div className="relative inline-block text-left">
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm"
          >
            Filter by Government Form <ChevronDown size={16} />
          </button>

          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-10"
            >
              <button
                onClick={() => handleSelect("all")}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-800"
              >
                All Documents
              </button>
              <button
                onClick={() => handleSelect("form_16")}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-800"
              >
                Form 16 Docs
              </button>
              <button
                onClick={() => handleSelect("itr_1")}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-800"
              >
                ITR-1 Docs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Filtered Categories */}
      {Object.entries(groupedDocs).map(([category, documents]) => (
        <DocumentCategory key={category} title={category} documents={documents} />
      ))}
    </div>
  );
}

export default TaxManager;
