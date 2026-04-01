const variants = {
  primary: 'badge badge-primary',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
  accent: 'badge badge-accent'
};

const Badge = ({ variant = 'primary', className = '', children, ...props }) => {
  return (
    <span className={`${variants[variant] || variants.primary} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

export default Badge;
