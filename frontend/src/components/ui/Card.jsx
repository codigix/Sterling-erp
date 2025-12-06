import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'sm',
  ...props
}) => {
  const baseClasses = 'bg-slate-800 border border-slate-700 rounded-lg transition-shadow duration-200';

  const shadows = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const classes = `${baseClasses} ${shadows[shadow]} ${paddings[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 pb-4 border-b border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

const CardSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter };
export default Card;
