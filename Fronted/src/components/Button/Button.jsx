import styles from './Button.module.css';

function Button({ children, href, type = 'button', ...props }) {
  if (href) {
    return (
      <a className={styles.button} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={styles.button} type={type} {...props}>
      {children}
    </button>
  );
}

export default Button;
