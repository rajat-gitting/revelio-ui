import '@testing-library/jest-dom/vitest';
import '../styles/global.scss';

Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
