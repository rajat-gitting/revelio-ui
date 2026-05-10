import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from '@/components/Button/Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : styles.danger;
  const combined = [variantClass, className].filter(Boolean).join(' ');

  return (
    <button type={type} className={combined} {...rest}>
      {children}
    </button>
  );
}
