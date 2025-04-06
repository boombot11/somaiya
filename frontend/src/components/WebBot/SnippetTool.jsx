import React, { useState, useEffect, useRef } from "react";
import domtoimage from "dom-to-image";
import { useUrl } from "../contexts/urlContext";
const preventSelection = (e) => e.preventDefault();
const SnippetTool = ({ onCapture, setIsOpen, setChat, onClose, triggerSnipping }) => {
  const [isSnipping, setIsSnipping] = useState(false);
  const [selection, setSelection] = useState(null);
  const { setImageUrl, setImageData } = useUrl();
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef(null);
  const startPoint = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [windowScroll, setWindowScroll] = useState({ x: 0, y: 0 });
  const [captureMode, setCaptureMode] = useState(null);



  useEffect(() => {
    if (isSnipping) {
      document.addEventListener("selectstart", preventSelection);
    } else {
      document.removeEventListener("selectstart", preventSelection);
    }
  
    return () => {
      document.removeEventListener("selectstart", preventSelection);
    };
  }, [isSnipping]);
  const [showSelectionBox, setShowSelectionBox] = useState(true);

  // Track cursor movement globally
  const handleMouseMoveGlobal = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMoveGlobal);
    return () => window.removeEventListener("mousemove", handleMouseMoveGlobal);
  }, []);

  // Keyboard shortcut activation (only shows buttons first)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.code === "Space") {
        showCaptureOptions();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (triggerSnipping) {
      showCaptureOptions();
    }
  }, [triggerSnipping]);

  const showCaptureOptions = () => {
    setIsSnipping(true);
    setCaptureMode(null);
  };

  const startSelectionSnipping = () => {
    setIsOpen(false);
    setCaptureMode("selection");
    document.body.style.cursor = "crosshair";
    setWindowScroll({ x: window.scrollX, y: window.scrollY });

    // Ensure cursorPosition updates immediately
    setCursorPosition({ x: window.event.clientX, y: window.event.clientY });
  };

  // OPTION A: Selection-based Snipping
  const handleMouseDown = (e) => {
    if (!isSnipping || captureMode !== "selection") return;
    e.stopPropagation();

    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;

    startPoint.current = { x, y };
    setSelection({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const x = Math.min(e.clientX + window.scrollX, startPoint.current.x);
    const y = Math.min(e.clientY + window.scrollY, startPoint.current.y);
    const width = Math.abs(e.clientX + window.scrollX - startPoint.current.x);
    const height = Math.abs(e.clientY + window.scrollY - startPoint.current.y);

    setSelection({ x, y, width, height });
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsSnipping(false);
  
    if (!selection || selection.width < 10 || selection.height < 10) {
      resetSnipping();
      return;
    }
  
    document.body.style.cursor = "default";
  
    try {
      const { x, y, width, height } = selection;
  
      // Hide overlays temporarily
      setShowSelectionBox(false);
      await new Promise(res => requestAnimationFrame(res));
  
      // Create a clean cloned area
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = `-${x}px`;
      wrapper.style.top = `-${y}px`;
      wrapper.style.width = `${document.body.scrollWidth}px`;
      wrapper.style.height = `${document.body.scrollHeight}px`;
      wrapper.style.pointerEvents = "none";
      wrapper.style.zIndex = "-9999";
  
      const clone = document.body.cloneNode(true);
  
      // Remove SnippetTool overlay/cursor if present
      const overlays = clone.querySelectorAll('[data-snippet-overlay]');
      overlays.forEach(el => el.remove());
  
      wrapper.appendChild(clone);
  
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = "hidden";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-9999";
      container.appendChild(wrapper);
      document.body.appendChild(container);
  
      await new Promise(res => setTimeout(res, 50)); // allow styles/render to apply
  
      const dataUrl = await domtoimage.toPng(container, {
        width,
        height,
        cacheBust: true,
        quality: 1,
      });
  
      document.body.removeChild(container);
  
      setImageUrl(dataUrl);
      const blob = await fetch(dataUrl).then(res => res.blob());
      setImageData(blob);
      setChat(true);
  
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    } finally {
      setShowSelectionBox(true); // Restore UI
      resetSnipping();
    }
  };
  

  const handleCaptureElement = async () => {
    setIsOpen(false);
    setIsSnipping(false);


    try {
      console.log("Capturing specific element...");
      const dataUrl = await domtoimage.toPng(document.body, { quality: 1, cacheBust: true });

      setImageUrl(dataUrl);
      const blob = await fetch(dataUrl).then(res => res.blob());
      setImageData(blob);
      setChat(true)
    } catch (error) {
      console.error("Error capturing element screenshot:", error);
    }
  };

  const resetSnipping = () => {
    setIsSnipping(false);
    setSelection(null);
    setIsDragging(false);
    document.body.style.cursor = "default";
    setCaptureMode(null);
  };

  return (
    <>
      {isSnipping && (
        <>
          {/* Capture Options Panel - Appears First */}
          {captureMode === null && (
            <div className="z-50 fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-white text-center text-lg mb-4">Choose Mode</h2>
                <div className="flex gap-4">
                  <button
                    onClick={startSelectionSnipping}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Capture Selection
                  </button>
          
                  {/* <button
                    onClick={handleCaptureElement}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Capture Element
                  </button> */}
                </div>
              </div>
            </div>
          )}

          {/* Selection Overlay (Only when selection mode is active) */}
          {captureMode === "selection" && (
            <div
              ref={overlayRef}
              className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                cursor: "crosshair",
                zIndex: 9999,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Cursor Indicator - NOW TRACKS CORRECTLY */}
              <div
                style={{
                  position: "fixed",
                  width: "15px",
                  height: "15px",
                  backgroundColor: "red",
                  borderRadius: "50%",
                  border: "2px solid white",
                  pointerEvents: "none",
                  left: `${cursorPosition.x}px`,
                  top: `${cursorPosition.y}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10000,
                  transition: "transform 0.05s ease",
                }}
              />

              {showSelectionBox && selection && (
                <div
                  style={{
                    position: "absolute",
                    left: `${selection.x - window.scrollX}px`,
                    top: `${selection.y - window.scrollY}px`,
                    width: `${selection.width}px`,
                    height: `${selection.height}px`,
                    border: "3px dashed rgba(59, 130, 246, 0.8)",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    boxShadow: "0 0 0 10000px rgba(0,0,0,0.5)",
                    pointerEvents: "none",
                    zIndex: 9999,
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default SnippetTool;