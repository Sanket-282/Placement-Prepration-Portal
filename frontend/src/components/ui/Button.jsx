const variants = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  accent: 'btn btn-accent',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger',
  success: 'btn btn-success'
};

const sizes = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg'
};

const Button = ({
  as: Component = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) => {
  const classes = `${variants[variant] || variants.primary} ${sizes[size] || ''} ${className}`.trim();

  return <Component type={Component === 'button' ? type : undefined} className={classes} {...props} />;
};

export default Button;
