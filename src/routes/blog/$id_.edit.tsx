import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { getBlogById, updateBlog } from '@/api/services/blogService';
import { useApi } from '@/hooks/useApi';
import Button from '@/components/Button/Button';
import styles from './create.module.scss';

export const Route = createFileRoute('/blog/$id_/edit')({
  component: EditBlogPage,
});

interface FormState {
  title: string;
  summary: string;
  content: string;
  tags: string;
  authorName: string;
  authorAvatarUrl: string;
  coverImageUrl: string;
}

interface FormErrors {
  title?: string;
  summary?: string;
  content?: string;
  authorName?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = 'Title is required.';
  if (!form.summary.trim()) errors.summary = 'Summary is required.';
  if (!form.content.trim()) errors.content = 'Content is required.';
  if (!form.authorName.trim()) errors.authorName = 'Author name is required.';
  return errors;
}

function EditBlogPage() {
  const { id } = Route.useParams();
  const numericId = parseInt(id, 10);
  const navigate = useNavigate();

  const { data: blog, loading, error: loadError } = useApi(
    () => getBlogById(numericId),
    numericId
  );

  const [form, setForm] = useState<FormState>({
    title: '',
    summary: '',
    content: '',
    tags: '',
    authorName: '',
    authorAvatarUrl: '',
    coverImageUrl: '',
  });

  const [prefilled, setPrefilled] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (blog && !prefilled) {
      setForm({
        title: blog.title,
        summary: blog.excerpt,
        content: blog.body,
        tags: blog.tags.join(', '),
        authorName: blog.author.name,
        authorAvatarUrl: blog.author.avatarUrl ?? '',
        coverImageUrl: blog.coverImageUrl ?? '',
      });
      setPrefilled(true);
    }
  }, [blog, prefilled]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateBlog(numericId, {
        title: form.title.trim(),
        excerpt: form.summary.trim(),
        body: form.content.trim(),
        tags,
        author: {
          name: form.authorName.trim(),
          avatarUrl: form.authorAvatarUrl.trim() || null,
        },
        coverImageUrl: form.coverImageUrl.trim() || null,
      });
      await navigate({ to: '/', search: { q: '', category: [], author: [], page: 1 } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update blog post.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page} data-testid="edit-blog-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (loadError ?? !blog) {
    return (
      <div className={styles.page} data-testid="edit-blog-error">
        <p>{loadError ?? 'Blog post not found.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="edit-blog-page">
      <h1 className={styles.heading}>Edit Blog</h1>

      {submitError && (
        <p className={styles.submitError} role="alert" data-testid="submit-error">
          {submitError}
        </p>
      )}

      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className={styles.form} data-testid="edit-blog-form">
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>Title</label>
          <input
            id="title"
            name="title"
            type="text"
            className={styles.input}
            value={form.title}
            onChange={handleChange}
            aria-describedby={errors.title ? 'title-error' : undefined}
            data-testid="field-title"
          />
          {errors.title && (
            <span id="title-error" className={styles.error} role="alert" data-testid="error-title">
              {errors.title}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="summary" className={styles.label}>Summary</label>
          <textarea
            id="summary"
            name="summary"
            className={styles.textarea}
            rows={3}
            value={form.summary}
            onChange={handleChange}
            aria-describedby={errors.summary ? 'summary-error' : undefined}
            data-testid="field-summary"
          />
          {errors.summary && (
            <span id="summary-error" className={styles.error} role="alert" data-testid="error-summary">
              {errors.summary}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="content" className={styles.label}>Content</label>
          <textarea
            id="content"
            name="content"
            className={styles.textarea}
            rows={10}
            value={form.content}
            onChange={handleChange}
            aria-describedby={errors.content ? 'content-error' : undefined}
            data-testid="field-content"
          />
          {errors.content && (
            <span id="content-error" className={styles.error} role="alert" data-testid="error-content">
              {errors.content}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="tags" className={styles.label}>Tags (comma-separated)</label>
          <input
            id="tags"
            name="tags"
            type="text"
            className={styles.input}
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g. react, typescript, tutorial"
            data-testid="field-tags"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="authorName" className={styles.label}>Author</label>
          <input
            id="authorName"
            name="authorName"
            type="text"
            className={styles.input}
            value={form.authorName}
            onChange={handleChange}
            aria-describedby={errors.authorName ? 'authorName-error' : undefined}
            data-testid="field-authorName"
          />
          {errors.authorName && (
            <span id="authorName-error" className={styles.error} role="alert" data-testid="error-authorName">
              {errors.authorName}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="authorAvatarUrl" className={styles.label}>Author Avatar URL (optional)</label>
          <input
            id="authorAvatarUrl"
            name="authorAvatarUrl"
            type="text"
            className={styles.input}
            value={form.authorAvatarUrl}
            onChange={handleChange}
            data-testid="field-authorAvatarUrl"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="coverImageUrl" className={styles.label}>Cover Image URL (optional)</label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="text"
            className={styles.input}
            value={form.coverImageUrl}
            onChange={handleChange}
            data-testid="field-coverImageUrl"
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={submitting} data-testid="submit-button">
            {submitting ? 'Saving…' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  );
}
