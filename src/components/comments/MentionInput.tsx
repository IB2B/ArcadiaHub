'use client';

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';

interface UserSuggestion {
  id: string;
  contact_first_name: string | null;
  contact_last_name: string | null;
  company_name: string | null;
  logo_url: string | null;
}

interface MentionInputProps {
  onSubmit: (content: string, mentions: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Token format stored in content: @[userId:Display Name]
// Rendered as highlighted chip in CommentItem

export default function MentionInput({ onSubmit, disabled, placeholder }: MentionInputProps) {
  const t = useTranslations('comments');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [collectedMentions, setCollectedMentions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data: UserSuggestion[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
      setDropdownIndex(0);
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart ?? text.length;
    setValue(text);

    // Find the @ trigger before cursor
    const textBeforeCursor = text.slice(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.slice(atIndex + 1);
      // No spaces allowed in mention query
      if (!afterAt.includes(' ') && !afterAt.includes('@')) {
        setMentionStart(atIndex);
        setMentionQuery(afterAt);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(afterAt), 300);
        return;
      }
    }

    // Not in mention mode
    setMentionStart(null);
    setMentionQuery('');
    setShowDropdown(false);
  };

  const insertMention = (user: UserSuggestion) => {
    if (mentionStart === null) return;

    const displayName = user.company_name ||
      `${user.contact_first_name ?? ''} ${user.contact_last_name ?? ''}`.trim() ||
      user.id;
    const token = `@[${user.id}:${displayName}]`;

    // Replace @query with token
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + mentionQuery.length);
    const newValue = before + token + ' ' + after;

    setValue(newValue);
    setShowDropdown(false);
    setMentionStart(null);
    setMentionQuery('');
    setCollectedMentions((prev) => [...new Set([...prev, user.id])]);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + token.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDropdownIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (suggestions[dropdownIndex]) {
        insertMention(suggestions[dropdownIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // Extract mentions from token format
    const mentionRegex = /@\[([^:]+):[^\]]+\]/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(trimmed)) !== null) {
      mentions.push(match[1]);
    }

    onSubmit(trimmed, [...new Set(mentions)]);
    setValue('');
    setCollectedMentions([]);
    setShowDropdown(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? t('placeholder')}
            disabled={disabled}
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none disabled:opacity-60"
          />

          {/* Mention dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
              {suggestions.map((user, idx) => {
                const displayName = user.company_name ||
                  `${user.contact_first_name ?? ''} ${user.contact_last_name ?? ''}`.trim() ||
                  user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertMention(user); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--card-hover)] transition-colors ${idx === dropdownIndex ? 'bg-[var(--card-hover)]' : ''}`}
                  >
                    <Avatar size="xs" name={displayName} src={user.logo_url ?? undefined} />
                    <span className="text-[var(--text)] truncate">{displayName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
