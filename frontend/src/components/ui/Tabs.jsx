import React, { useState } from "react";

const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className="w-full">
      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <div
              key={index}
              onClick={() => handleTabChange(index)}
              className={`flex flex-col items-center gap-2 cursor-pointer px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none border-b-2 ${
                activeTab === index
                  ? "text-blue-500 border-b-blue font-bold"
                  : "  text-white border-b-transparent bg-transparent"
              }`}
            >
              {Icon && (
                <Icon
                  size={24}
                  className={
                    activeTab === index
                      ? "text-blue-500 font-bold"
                      : "text-white"
                  }
                />
              )}
              {tab.label}
            </div>
          );
        })}
      </div>
      <div className="mt-6">{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default Tabs;
