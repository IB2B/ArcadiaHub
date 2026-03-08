'use server';

import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import {
  notifyCaseCreated,
  notifyCaseStatusChanged,
  notifyAdminsCaseCreated,
} from '@/lib/services/notificationService';
import { PaginatedResult, ListOptions } from './types';

type Profile = Tables<'profiles'>;
type Case = Tables<'cases'>;

export async function getAdminCases(options: ListOptions & {
  status?: string;
  partnerId?: string;
}): Promise<PaginatedResult<Case & { partner?: Profile }>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status, partnerId } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('cases')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`case_code.ilike.%${safeSearch}%,client_name.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data: cases, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin cases:', { error });
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  if (!cases || cases.length === 0) {
    return { data: [], count: count || 0, page, pageSize, totalPages: Math.ceil((count || 0) / pageSize) };
  }

  const partnerIds = [...new Set(cases.map(c => c.partner_id).filter(Boolean))];
  const { data: partners } = await supabase
    .from('profiles')
    .select('id, email, company_name')
    .in('id', partnerIds);

  const partnerMap = new Map(partners?.map(p => [p.id, p]) || []);

  const casesWithPartners = cases.map(c => ({
    ...c,
    partner: partnerMap.get(c.partner_id) as Profile | undefined,
  }));

  return {
    data: casesWithPartners,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminCase(id: string): Promise<(Case & { partner?: Profile }) | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching case:', { error });
    return null;
  }

  let partner: Profile | undefined;
  if (caseData.partner_id) {
    const { data: partnerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', caseData.partner_id)
      .single();
    partner = partnerData || undefined;
  }

  return { ...caseData, partner };
}

export async function createCase(data: TablesInsert<'cases'>): Promise<{ success: boolean; error?: string; data?: Case }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from('cases')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from('case_history').insert({
    case_id: result.id,
    new_status: data.status || 'PENDING',
    notes: 'Case created',
  });

  if (result.partner_id) {
    notifyCaseCreated({
      id: result.id,
      case_code: result.case_code,
      partner_id: result.partner_id,
      client_name: result.client_name,
    }).catch((e) => logger.error('Background notification failed', { error: e }));
  }

  notifyAdminsCaseCreated({
    id: result.id,
    case_code: result.case_code,
    client_name: result.client_name,
  }).catch((e) => logger.error('Background notification failed', { error: e }));

  revalidatePath('/[locale]/admin/cases');
  return { success: true, data: result };
}

export async function updateCase(id: string, data: TablesUpdate<'cases'>, _historyNote?: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: currentCase } = await supabase.from('cases').select('status, case_code, partner_id').eq('id', id).single();

  const { error } = await supabase
    .from('cases')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.status && currentCase?.status !== data.status) {
    if (currentCase?.partner_id && currentCase.status) {
      notifyCaseStatusChanged({
        id,
        case_code: currentCase.case_code,
        partner_id: currentCase.partner_id,
        old_status: currentCase.status,
        new_status: data.status,
      }).catch((e) => logger.error('Background notification failed', { error: e }));
    }
  }

  revalidatePath('/[locale]/admin/cases');
  revalidatePath('/[locale]/admin/cases/[id]');
  return { success: true };
}

export async function deleteCase(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error: historyError } = await supabase.from('case_history').delete().eq('case_id', id);
  if (historyError) return { success: false, error: `Failed to delete case history: ${historyError.message}` };

  const { error: docsError } = await supabase.from('case_documents').delete().eq('case_id', id);
  if (docsError) return { success: false, error: `Failed to delete case documents: ${docsError.message}` };

  const { error } = await supabase.from('cases').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/cases');
  return { success: true };
}
