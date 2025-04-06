import { useState } from "react";
import { Upload, Download, ChevronDown, ChevronRight } from "lucide-react";

const DocumentCard = ({ title, uploadedAt, isUploaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null); // For storing the selected file
  const [uploading, setUploading] = useState(false);
  const [timestamp, setTimestamp] = useState(uploadedAt || null); // Initialize with the passed timestamp
  const [fileName, setFileName] = useState(title || null); // Initialize with the passed title
  const [summary, setSummary] = useState(null); // For storing the summary response

  const renderFormattedSummary = (text) => {
    if (!text) return null;
  
    const lines = text.split('\n').filter((line) => line.trim() !== '');
  
    return lines.map((line, index) => {
      // Match "**Title:** content"
      const match = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
  
      if (match) {
        const [, title, content] = match;
        return (
          <div key={index} className="mb-3">
            <div className="text-white font-bold text-base">{title}:</div>
            <div className="text-sm text-zinc-400 mt-1">{content}</div>
          </div>
        );
      }
  
      // Handle bullet points or plain paragraphs
      return (
        <div key={index} className="text-sm text-zinc-400 mb-2">
          {line}
        </div>
      );
    });
  };
  

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name); // Update fileName with selected file's name
    } else {
      alert("Please upload a PDF file.");
    }
  };

  // Handle the upload process
  const handleUpload = async () => {
    if (!file) return; // No file selected

    setUploading(true); // Set uploading state to true

    const formData = new FormData();
    formData.append("file", file); // Append the selected file

    try {
      const response = await fetch("http://localhost:5000/pdf-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) {
        // If upload is successful, update state with the received data
        setSummary(data.gemini_response);
        setTimestamp(data.uploaded_time);
        setFileName(data.file_name);
      } else {
        alert("Error: " + data.error); // Handle error if any
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during the upload.");
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  return (
    <div className="complex-component bg-zinc-800 w-full rounded-xl mb-3 overflow-hidden transition-all duration-200">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={18} className="text-white" />
          ) : (
            <ChevronRight size={18} className="text-white" />
          )}
          <div className="text-white font-semibold">
            {fileName || title} {timestamp && <span>({timestamp})</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md text-white text-sm"
          >
            {uploading ? "Uploading..." : isUploaded ? "Download" : "Upload"}
          </button>
          <label
            htmlFor="file-input"
            className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded-md text-white text-sm cursor-pointer"
          >
            Choose File
          </label>
        </div>
      </div>

      {isOpen && (
        <div className="bg-zinc-900 px-6 pb-4 text-sm text-zinc-300">
     {summary ? (
  <div>
    <div className="text-white font-semibold mb-3 text-base">Summary:</div>
    <div>{renderFormattedSummary(summary)}</div>
  </div>
) : (
  <div>No file uploaded yet.</div>
)}


        </div>
      )}

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="file-input"
      />
    </div>
  );
};

export default DocumentCard;
