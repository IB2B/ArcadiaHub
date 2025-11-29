'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Link } from '@/navigation';
import { Tables } from '@/types/database.types';
import { updateBlogPost, deleteBlogPost, type PaginatedResult } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
} from '@/components/ui/Table';

type BlogPost = Tables<'blog_posts'>;

interface BlogClientProps {
  initialData: PaginatedResult<BlogPost>;
  initialFilters: {
    search: string;
    category: string;
    published: string;
  };
}

export default function BlogClient({ initialData, initialFilters }: BlogClientProps) {
  const t = useTranslations('admin');
  const tBlog = useTranslations('admin.blog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [category, setCategory] = useState(initialFilters.category);
  const [published, setPublished] = useState(initialFilters.published);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique categories from posts
  const categories = Array.from(
    new Set(initialData.data.map((p) => p.category).filter(Boolean))
  ) as string[];

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.delete('page');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Handle search
  const handleSearch = useCallback(() => {
    updateFilters({ search });
  }, [search, updateFilters]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Handle publish toggle
  const handleTogglePublish = useCallback(async (post: BlogPost) => {
    startTransition(async () => {
      const now = new Date().toISOString();
      await updateBlogPost(post.id, {
        is_published: !post.is_published,
        published_at: !post.is_published ? now : null,
      });
      router.refresh();
    });
  }, [router]);

  // Handle delete
  const handleDeleteClick = useCallback((post: BlogPost) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBlogPost(postToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  }, [postToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setPublished('');
    startTransition(() => {
      router.push('/admin/blog');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'category',
      options: [
        { value: '', label: tBlog('filters.allCategories') || 'All Categories' },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ],
      value: category,
      onChange: (value: string) => {
        setCategory(value);
        updateFilters({ category: value });
      },
      width: 'w-36',
    },
    {
      key: 'published',
      options: [
        { value: '', label: tBlog('filters.all') || 'All' },
        { value: 'true', label: t('status.published') },
        { value: 'false', label: t('status.draft') },
      ],
      value: published,
      onChange: (value: string) => {
        setPublished(value);
        updateFilters({ published: value });
      },
      width: 'w-28',
    },
  ], [category, published, categories, tBlog, t, updateFilters]);

  const hasActiveFilters = Boolean(search || category || published);

  return (
    <>
      <AdminFilterBar
        searchValue={search}
        searchPlaceholder={t('actions.search')}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        newHref="/admin/blog/new"
        newLabel={t('actions.newPost')}
        isLoading={isPending}
      />

      {/* Blog Posts Table */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tBlog('postTitle')}</TableHead>
              <TableHead className="hidden md:table-cell">{tBlog('category')}</TableHead>
              <TableHead className="hidden lg:table-cell">{tBlog('publishedAt')}</TableHead>
              <TableHead>{tBlog('isPublished')}</TableHead>
              <TableHead width="120px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.data.length === 0 ? (
              <TableEmpty colSpan={5} message={tBlog('noPosts')} />
            ) : (
              initialData.data.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Featured Image Thumbnail */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[var(--card-hover)]">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Title and Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--text)] truncate max-w-[250px]">
                          {post.title}
                        </p>
                        {post.excerpt && (
                          <p className="text-xs text-[var(--text-muted)] truncate max-w-[250px]">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-[var(--text-muted)] font-mono">
                          /{post.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.category ? (
                      <Badge variant="default" size="sm">
                        {post.category}
                      </Badge>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {post.published_at ? (
                      <span className="text-sm text-[var(--text-muted)]">
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.is_published ? 'success' : 'default'}
                      size="sm"
                    >
                      {post.is_published ? t('status.published') : t('status.draft')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/blog/${post.id}`}>
                        <Button variant="ghost" size="sm" title={t('actions.edit')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(post)}
                        title={post.is_published ? t('actions.unpublish') : t('actions.publish')}
                      >
                        {post.is_published ? (
                          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(post)}
                        title={t('actions.delete')}
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {initialData.totalPages > 1 && (
          <Pagination
            currentPage={initialData.page}
            totalPages={initialData.totalPages}
            totalItems={initialData.count}
            itemsPerPage={initialData.pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tBlog('confirmDelete')}
        message="This action cannot be undone. The blog post will be permanently deleted."
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
