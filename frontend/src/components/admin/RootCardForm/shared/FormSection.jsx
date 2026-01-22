import React from "react";

export default function FormSection({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-gradient-to-br from-white to-purple-50/20 border border-slate-200 rounded-lg p-4 space-y-3">
      {(title || Icon) && (
        <div className="flex items-center text-xs gap-2.5 mb-4 pb-3 border-b border-slate-100">
          {Icon && <Icon className="text-purple-600" size={20} />}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 text-left">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
