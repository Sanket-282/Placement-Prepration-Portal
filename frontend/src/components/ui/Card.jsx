const Card = ({ className = '', elevated = false, hover = false, children, ...props }) => {
  const classes = [
    'card',
    elevated ? 'card-elevated' : '',
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} {...props}>{children}</div>;
};

export default Card;
