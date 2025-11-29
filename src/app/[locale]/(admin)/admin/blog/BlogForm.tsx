'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createBlogPost, updateBlogPost } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type BlogPost = Tables<'blog_posts'>;

interface BlogFormProps {
  postData?: BlogPost;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function BlogForm({ postData }: BlogFormProps) {
  const t = useTranslations('admin');
  const tBlog = useTranslations('admin.blog');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!postData;

  // Form state
  const [formData, setFormData] = useState({
    title: postData?.title || '',
    slug: postData?.slug || '',
    excerpt: postData?.excerpt || '',
    content: postData?.content || '',
    featured_image: postData?.featured_image || '',
    category: postData?.category || '',
    tags: postData?.tags?.join(', ') || '',
    is_published: postData?.is_published ?? false,
  });

  // Update field
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updateField('slug', slug);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = tForm('required');
    }

    if (!formData.slug.trim()) {
      newErrors.slug = tForm('required');
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.content.trim()) {
      newErrors.content = tForm('required');
    }

    // Validate featured image URL if provided
    if (formData.featured_image && !/^https?:\/\/.+/.test(formData.featured_image)) {
      newErrors.featured_image = tForm('invalidUrl');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        const tags = formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null;

        if (isEditing && postData) {
          const updateData: TablesUpdate<'blog_posts'> = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || null,
            content: formData.content,
            featured_image: formData.featured_image || null,
            category: formData.category || null,
            tags,
            is_published: formData.is_published,
            published_at: formData.is_published && !postData.is_published
              ? new Date().toISOString()
              : postData.published_at,
          };

          const result = await updateBlogPost(postData.id, updateData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          const insertData: TablesInsert<'blog_posts'> = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || null,
            content: formData.content,
            featured_image: formData.featured_image || null,
            category: formData.category || null,
            tags,
            is_published: formData.is_published,
            published_at: formData.is_published ? new Date().toISOString() : null,
          };

          const result = await createBlogPost(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            setTimeout(() => {
              router.push('/admin/blog');
            }, 1500);
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        }
      } catch {
        setMessage({ type: 'error', text: tMessages('error') });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title={tBlog('details')} />
            <CardContent className="space-y-4">
              <Input
                label={tBlog('postTitle')}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                error={errors.title}
                required
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label={tBlog('slug')}
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    error={errors.slug}
                    required
                    placeholder="url-friendly-slug"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <Textarea
                label={tBlog('excerpt')}
                value={formData.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                rows={2}
                placeholder="Brief summary of the post..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title={tBlog('content')} />
            <CardContent>
              <Textarea
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                error={errors.content}
                rows={15}
                placeholder="Write your blog post content here... (Markdown supported)"
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Publishing" />
            <CardContent>
              <Toggle
                label={tBlog('isPublished')}
                description="Published posts are visible on the blog"
                checked={formData.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Metadata" />
            <CardContent className="space-y-4">
              <Input
                label={tBlog('featuredImage')}
                type="url"
                value={formData.featured_image}
                onChange={(e) => updateField('featured_image', e.target.value)}
                error={errors.featured_image}
                placeholder="https://..."
              />
              <Input
                label={tBlog('category')}
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g., News, Tutorial"
              />
              <Input
                label={tBlog('tags')}
                value={formData.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
                hint="Comma-separated list"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t('actions.cancel')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? t('actions.update') : t('actions.create')}
        </Button>
      </div>
    </form>
  );
}
