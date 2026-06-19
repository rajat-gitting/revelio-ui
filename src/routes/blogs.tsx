import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/blogs')({
  beforeLoad: () => {
    throw redirect({ to: '/', search: { q: '', category: [], author: [], page: 1 } });
  },
});
