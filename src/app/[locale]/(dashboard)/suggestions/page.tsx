import { getMySuggestions } from '@/lib/data/suggestions';
import SuggestionsClient from './SuggestionsClient';

export default async function SuggestionsPage() {
  const suggestions = await getMySuggestions();
  return <SuggestionsClient suggestions={suggestions} />;
}
