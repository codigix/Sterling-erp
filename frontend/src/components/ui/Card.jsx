import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'sm',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg transition-shadow duration-200';

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
    default: 'p-4',
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
  <div className={`mb-4 pb-4 border-b border-slate-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-md font-semibold  ${className}`} {...props}>
    {children}
  </h3>
);

const CardSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-600 mt-1 text-left ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-slate-200 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter };
export default Card;
