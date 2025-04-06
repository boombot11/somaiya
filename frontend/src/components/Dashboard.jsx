import React, { useState, useEffect } from "react";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssistantIcon from "@mui/icons-material/Assistant";
import BarChartIcon from "@mui/icons-material/BarChart";
import PublicIcon from "@mui/icons-material/Public";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Overview from "../utils/DashboardUtils/Overview";
import Chatbot from "./Chatbot";
import Social from "./Social";
import Kanban from "./Kanban";
import ConsultantChat from "./ConsultantChat";
import UserChat from "./UserChat";
import JitsiMeeting from "./Meet";
import TaxManager from "./TaxManager";
import Calculators from "./Calculator";

const Dashboard = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [selectedContent, setSelectedContent] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("");

  if (localStorage.getItem("selectedContent") !== null) {
    useEffect(() => {
      const storedContent = localStorage.getItem("selectedContent");
      if (storedContent) {
        setSelectedContent(storedContent);
      }
    }, []);
  }

  const handleItemClick = (content) => {
    setSelectedContent(content);
  };

  return (
    <>
      <div className="flex h-screen bg-neutral-900 text-white">
        {/* Sidebar */}
        <div
          className={`h-full bg-neutral-800 ${
            openSidebar ? "w-64" : "w-20"
          } transition-all bg-cover bg-center duration-300`}
          style={{ backgroundImage: "url('/chat-bg2.jpg')" }}
        >
          <div className="p-6 flex flex-col border-0 border-r-1 border-r-gray-400/50 justify-between h-full bg-black/40">
            <div className="border border-gray-400/40 p-5 rounded-lg backdrop-blur-md">
              <div className="chatList select-none flex flex-col h-full">
                <span className="title text-xs font-semibold mb-2 opacity-60">
                  DASHBOARD
                </span>
                <ul>
                  <li
                    className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                      selectedContent === "overview" ? "bg-neutral-700/55" : ""
                    }`}
                    onClick={() => handleItemClick("overview")}
                  >
                    <BarChartIcon className="scale-75 opacity-75" />
                    Overview
                  </li>
                  <li
                    className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                      selectedContent === "insights" ? "bg-neutral-700/55" : ""
                    }`}
                    onClick={() => handleItemClick("insights")}
                  >
                    <AssistantIcon className="scale-75 opacity-75" />
                    Insights
                  </li>
                </ul>
                <hr className="my-4 border-neutral-600 opacity-90" />
                <span className="title text-xs font-semibold mb-2 opacity-60">
                  FEATURES
                </span>
                <div className="list h-[30vh] text-md flex flex-col overflow-auto">
                  <ul>
                    <li
                      className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                        selectedContent === "kanban" ? "bg-neutral-700/60" : ""
                      }`}
                      onClick={() => handleItemClick("kanban")}
                    >
                      <CalendarTodayIcon className="scale-75 opacity-75" />
                      Kanban
                    </li>
                    <li
                      className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                        selectedContent === "social" ? "bg-neutral-700/60" : ""
                      }`}
                      onClick={() => handleItemClick("social")}
                    >
                      <PublicIcon className="scale-75 opacity-75" />
                      Social
                    </li>
                    <li
                      className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                        selectedContent === "consulting"
                          ? "bg-neutral-700/60"
                          : ""
                      }`}
                      onClick={() => handleItemClick("consulting")}
                    >
                      <PeopleIcon className="scale-75 opacity-75" />
                      Consulting
                    </li>
                    <li
                      className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                        selectedContent === "faq" ? "bg-neutral-700/60" : ""
                      }`}
                      onClick={() => handleItemClick("faq")}
                    >
                      <HelpOutlineIcon className="scale-80 opacity-75" />
                      FAQ page
                    </li>
                    <li
                      className={`pl-6 text-white/80 flex gap-1 select-none py-2 px-4 rounded-lg hover:bg-neutral-700/50 cursor-pointer ${
                        selectedContent === "Calculator" ? "bg-neutral-700/60" : ""
                      }`}
                      onClick={() => handleItemClick("Calculator")}
                    >
                      <HelpOutlineIcon className="scale-80 opacity-75" />
                      Calculator
                    </li>
                  </ul>
                </div>
                <hr className="my-4 border-neutral-600 opacity-90 relative top-28" />
              </div>
              <div className="upgrade relative top-16 flex items-center justify-center gap-5 mt-auto text-xs">
                <div className="py-3 px-3 border border-gray-400/70 bg-gray-400/20 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="opacity-70 lucide lucide-user"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="scale-75 cursor-pointer opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-log-out"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-1 flex flex-col p-6 relative"
          style={{
            backgroundImage: "url('/sky4.jpg')",
            backgroundSize: "cover", // Ensures the image covers the entire div
            backgroundPosition: "center", // Centers the image
            backgroundRepeat: "no-repeat", // Prevents repeating the image
          }}
        >
          <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
          <h1 className="text-xl z-50 font-serif opacity-90 font-semibold text-white">
            {selectedContent === "overview" ? (
              "Overview"
            ) : (
              <>
                <span className="opacity-90">Overview</span>
                {""}
                <KeyboardArrowRightIcon className="opacity-80 inline-block mx-1" />
                {selectedContent.charAt(0).toUpperCase() +
                  selectedContent.slice(1)}
              </>
            )}
          </h1>

          {selectedContent === "overview" && (
            <div className="text-white overflow-y-scroll mt-4 relative z-10">
              <Overview />
            </div>
          )}
          {selectedContent === "insights" && (
            <div className="text-white overflow-y-hidden mt-4">
              <Chatbot />
            </div>
          )}
          {selectedContent === "kanban" && (
            <div className="text-white mt-4">
              <Kanban />
            </div>
          )}
           {selectedContent === "Calculator" && (
            <div className="z-50 text-white mt-4">
              <Calculators />
            </div>
          )}
          {selectedContent === "social" && (
            <div className="text-white overflow-y-scroll mt-4">
              <Social />
            </div>
          )}
          {selectedContent === "consulting" && (
            <div className="z-50 text-white overflow-y-scroll p-4 space-y-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-center mb-4">
  <div className="text-center">
    {/* Select Your Role Heading */}
    <h3 className="text-xl font-semibold mb-4">Select your Role:</h3>

    {/* Buttons Section */}
    <div className="space-x-4">
      <button
        className="border-2 border-blue-500 bg-blue-200 text-black dark:bg-blue-600 dark:text-white rounded-md px-6 py-2 transition-all duration-300 ease-in-out hover:bg-blue-300 dark:hover:bg-blue-500"
        onClick={() => setSelectedRole("user")}
      >
        User
      </button>
      <button
        className="border-2 border-gray-500 bg-white text-black dark:bg-gray-700 dark:text-white rounded-md px-6 py-2 transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-600"
        onClick={() => setSelectedRole("consultant")}
      >
        Consultant
      </button>
    </div>
  </div>
</div>

<div>
  {selectedRole === "user" ? (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 m-4 shadow-lg">
      <UserChat />
      <JitsiMeeting />
    </div>
  ) : selectedRole === "consultant" ? (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 m-4 shadow-lg">
      <ConsultantChat />
      <JitsiMeeting />
    </div>
  ) : null}
</div>
            </div>
          )}

          {selectedContent === "faq" && (
            <div className="text-white z-50 mt-4 overflow-y-scroll">
             <TaxManager />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
