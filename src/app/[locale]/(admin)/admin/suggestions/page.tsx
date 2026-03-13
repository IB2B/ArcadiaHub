import { getAllSuggestions } from '@/lib/data/suggestions';
import AdminSuggestionsClient from './AdminSuggestionsClient';

export default async function AdminSuggestionsPage() {
  const { suggestions, total } = await getAllSuggestions({ limit: 50 });
  return <AdminSuggestionsClient suggestions={suggestions} total={total} />;
}
