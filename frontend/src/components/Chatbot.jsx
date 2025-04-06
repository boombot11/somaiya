import React, { useState } from "react";
import { IconSend } from "@tabler/icons-react";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState(null);

  const handleAttachmentChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachment(file);
      setAttachmentType(file.type);
      setAttachmentPreview(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : file.name
      );
    }
  };

  const handleMessageSend = () => {
    if (!message.trim() && !attachment) return;

    const formData = new FormData();
    if (message.trim()) formData.append("message", message);
    if (attachment) formData.append("attachment", attachment);

    fetch("http://localhost:5000/insights", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Bad request");
        return response.json();
      })
      .then((data) => {
        setGeminiResponse(data.gemini_response);
        setMessages([
          ...messages,
          {
            text: message,
            attachment: attachmentPreview,
            attachmentType,
            fromUser: true,
          },
        ]);
        setMessage("");
        setAttachment(null);
        setAttachmentPreview(null);
        setAttachmentType("");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error: " + error.message);
      });
  };

  return (
    <div className="flex-1 flex h-[80vh] flex-col p-6 relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-scroll p-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-4 ${
              msg.fromUser ? "justify-end" : ""
            }`}
          >
            {msg.attachment ? (
              <div className="max-w-[70%]">
                {msg.attachmentType.startsWith("image") ? (
                  <img
                    src={msg.attachment}
                    alt="uploaded"
                    className="rounded-xl"
                  />
                ) : (
                  <div className="bg-gray-200 p-4 rounded-xl text-center">
                    {msg.attachmentType === "application/pdf" ? (
                      <span className="text-blue-500">PDF Document</span>
                    ) : msg.attachmentType === "text/csv" ? (
                      <span className="text-green-500">CSV File</span>
                    ) : msg.attachmentType === "text/plain" ? (
                      <span className="text-yellow-500">Text File</span>
                    ) : (
                      <span className="text-gray-500">File</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-purple-700 text-white p-4 rounded-xl max-w-[70%]">
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box & File Upload */}
      <div className="p-6 flex border-t border-neutral-700 items-center gap-2">
        <button
          className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl hover:bg-purple-200"
          onClick={() => document.getElementById("fileUpload").click()}
        >
          Upload
        </button>
        <input
          id="fileUpload"
          type="file"
          accept="image/*,.txt,.csv,application/pdf"
          className="hidden"
          onChange={handleAttachmentChange}
        />

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 text-white border border-gray-600 placeholder-gray-400"
        />

        <button
          onClick={handleMessageSend}
          className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600"
        >
          <IconSend className="h-5 w-5" />
        </button>
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="flex justify-center mt-2">
          <div className="bg-gray-800 p-4 rounded-xl text-white max-w-[80%] text-center">
            {attachmentType.startsWith("image") ? (
              <img
                src={attachmentPreview}
                className="w-24 h-12 object-cover rounded"
              />
            ) : (
              <p>{attachmentPreview}</p>
            )}
            <p className="text-sm text-gray-400">Attachment Preview</p>
            <button
              className="text-red-400 mt-2 underline"
              onClick={() => {
                setAttachment(null);
                setAttachmentPreview(null);
                setAttachmentType("");
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Gemini Response */}
      {geminiResponse && (
        <div className="mt-4 p-4 bg-gray-700 text-white rounded-xl">
          <strong>Gemini Response:</strong>
          <pre className="whitespace-pre-wrap mt-2">{geminiResponse}</pre>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
