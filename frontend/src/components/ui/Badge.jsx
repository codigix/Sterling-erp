import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center text-xs font-medium';

  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary-50 text-primary-700',
    secondary: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-cyan-50 text-cyan-700',
    gray: 'bg-slate-50 text-slate-600'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs rounded',
    sm: 'px-2 py-0.5 text-xs rounded-full',
    default: 'px-2.5 py-0.5 text-xs rounded-full',
    lg: 'px-3 py-1 text-sm rounded-full'
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;