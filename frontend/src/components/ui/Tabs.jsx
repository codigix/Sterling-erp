import React, { useState } from "react";

const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className="w-full">
      <div className="flex gap-0 border-b border-slate-600 overflow-x-auto dark:border-slate-600">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <div
              key={index}
              onClick={() => handleTabChange(index)}
              className={`flex flex-col items-center gap-2 cursor-pointer p-2 text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none border-b-2 ${
                activeTab === index
                  ? "text-blue-500 border-b-blue-500 font-bold dark:text-blue-400 dark:border-b-blue-400"
                  : "text-slate-400 border-b-transparent bg-transparent hover:text-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {Icon && (
                <Icon
                  size={24}
                  className={
                    activeTab === index
                      ? "text-blue-500 font-bold dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-500"
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
