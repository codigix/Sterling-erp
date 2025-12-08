import React from "react";

export default function FormSection({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && <Icon className="text-blue-400" size={24} />}
          <div>
            <h4 className="text-lg font-semibold text-white text-left">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
