'use server';

import { createClient, createServiceSupabaseClient } from '@/lib/database/server';
import { Database, Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { sendPartnerWelcomeEmail } from '@/lib/email';
import {
  notifyEventPublished,
  notifyCaseCreated,
  notifyCaseStatusChanged,
  notifyAdminsCaseCreated,
  notifyDocumentPublished,
  notifyAcademyContentPublished,
  notifyBlogPostPublished,
} from '@/lib/services/notificationService';

// ============================================================================
// TYPES
// ============================================================================

type Profile = Tables<'profiles'>;
type Case = Tables<'cases'>;
type Event = Tables<'events'>;
type AcademyContent = Tables<'academy_content'>;
type Document = Tables<'documents'>;
type BlogPost = Tables<'blog_posts'>;

export interface AdminStats {
  totalPartners: number;
  activePartners: number;
  totalCases: number;
  casesByStatus: Record<string, number>;
  totalEvents: number;
  upcomingEvents: number;
  totalAcademyContent: number;
  totalDocuments: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// ADMIN STATS
// ============================================================================

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  // Fetch all counts in parallel
  const [
    partnersResult,
    activePartnersResult,
    casesResult,
    eventsResult,
    upcomingEventsResult,
    academyResult,
    documentsResult,
    blogResult,
    publishedBlogResult,
    caseStatusResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PARTNER'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PARTNER').eq('is_active', true),
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_datetime', new Date().toISOString()),
    supabase.from('academy_content').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('cases').select('status'),
  ]);

  // Calculate cases by status
  const casesByStatus: Record<string, number> = {};
  if (caseStatusResult.data) {
    caseStatusResult.data.forEach((c) => {
      const status = c.status || 'UNKNOWN';
      casesByStatus[status] = (casesByStatus[status] || 0) + 1;
    });
  }

  return {
    totalPartners: partnersResult.count || 0,
    activePartners: activePartnersResult.count || 0,
    totalCases: casesResult.count || 0,
    casesByStatus,
    totalEvents: eventsResult.count || 0,
    upcomingEvents: upcomingEventsResult.count || 0,
    totalAcademyContent: academyResult.count || 0,
    totalDocuments: documentsResult.count || 0,
    totalBlogPosts: blogResult.count || 0,
    publishedBlogPosts: publishedBlogResult.count || 0,
  };
}

// ============================================================================
// PARTNER MANAGEMENT
// ============================================================================

export async function getAdminPartners(options: ListOptions & {
  status?: 'active' | 'inactive' | 'all';
  category?: string;
}): Promise<PaginatedResult<Profile>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status = 'all', category } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'PARTNER');

  // Apply filters
  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%,contact_first_name.ilike.%${search}%,contact_last_name.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin partners:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminPartner(id: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching partner:', error);
    return null;
  }

  return data;
}

export async function createPartner(data: Omit<TablesInsert<'profiles'>, 'id'>): Promise<{ success: boolean; error?: string; data?: Profile }> {
  const supabase = await createServiceSupabaseClient();

  // Create the auth user first (required before inserting into profiles due to RLS/FK)
  const tempPassword = crypto.randomUUID() + 'Aa1!';
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email!,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      company_name: data.company_name,
      contact_first_name: data.contact_first_name,
      contact_last_name: data.contact_last_name,
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // Update the profile row created by the DB trigger
  // Always start as inactive — account activates when partner sets up their password
  const { data: result, error: profileError } = await supabase
    .from('profiles')
    .update({
      company_name: data.company_name,
      contact_first_name: data.contact_first_name,
      contact_last_name: data.contact_last_name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      region: data.region,
      country: data.country,
      postal_code: data.postal_code,
      category: data.category,
      website: data.website,
      description: data.description,
      is_active: false,
      logo_url: data.logo_url,
      role: 'PARTNER',
    })
    .eq('id', userId)
    .select()
    .single();

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  // Generate a recovery link so the partner can set up their password
  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: data.email!,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    },
  });

  // Send welcome email with setup link (fire-and-forget)
  if (linkData?.properties?.action_link) {
    Promise.resolve().then(async () => {
      try {
        await sendPartnerWelcomeEmail({
          to: data.email!,
          firstName: data.contact_first_name || data.company_name || 'Partner',
          companyName: data.company_name || '',
          loginUrl: linkData.properties.action_link,
        });
      } catch (e) {
        console.error('Failed to send partner welcome email:', e);
      }
    });
  }

  revalidatePath('/admin/partners');
  return { success: true, data: result };
}

export async function updatePartner(id: string, data: TablesUpdate<'profiles'>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/partners');
  revalidatePath(`/admin/partners/${id}`);
  return { success: true };
}

export async function togglePartnerStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  return updatePartner(id, { is_active: isActive });
}

export async function deletePartner(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/partners');
  return { success: true };
}

/**
 * Upload partner logo to storage
 */
export async function uploadPartnerLogo(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createServiceSupabaseClient();

  const file = formData.get('file') as File;
  const partnerId = formData.get('partnerId') as string;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please upload an image.' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' };
  }

  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const path = `${partnerId || 'temp'}-${timestamp}.${ext}`;

  const { data, error } = await supabase.storage
    .from('partner-logos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading partner logo:', error);
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('partner-logos')
    .getPublicUrl(data.path);

  return { success: true, url: urlData.publicUrl };
}

// ============================================================================
// CASE MANAGEMENT
// ============================================================================

export async function getAdminCases(options: ListOptions & {
  status?: string;
  partnerId?: string;
}): Promise<PaginatedResult<Case & { partner?: Profile }>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status, partnerId } = options;
  const offset = (page - 1) * pageSize;

  // Query cases
  let query = supabase
    .from('cases')
    .select('*', { count: 'exact' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  if (search) {
    query = query.or(`case_code.ilike.%${search}%,client_name.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data: cases, count, error } = await query;

  if (error) {
    console.error('Error fetching admin cases:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  if (!cases || cases.length === 0) {
    return { data: [], count: count || 0, page, pageSize, totalPages: Math.ceil((count || 0) / pageSize) };
  }

  // Get unique partner IDs and fetch partner profiles
  const partnerIds = [...new Set(cases.map(c => c.partner_id).filter(Boolean))];
  const { data: partners } = await supabase
    .from('profiles')
    .select('id, email, company_name')
    .in('id', partnerIds);

  // Create a map for quick lookup
  const partnerMap = new Map(partners?.map(p => [p.id, p]) || []);

  // Merge cases with partner data
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
  const supabase = await createClient();

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching case:', error);
    return null;
  }

  // Fetch partner profile separately
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
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from('cases')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Create initial history entry
  await supabase.from('case_history').insert({
    case_id: result.id,
    new_status: data.status || 'PENDING',
    notes: 'Case created',
  });

  // Notify the partner about their new case
  if (result.partner_id) {
    notifyCaseCreated({
      id: result.id,
      case_code: result.case_code,
      partner_id: result.partner_id,
      client_name: result.client_name,
    }).catch(console.error);
  }

  // Notify admins about the new case
  notifyAdminsCaseCreated({
    id: result.id,
    case_code: result.case_code,
    client_name: result.client_name,
  }).catch(console.error);

  revalidatePath('/admin/cases');
  return { success: true, data: result };
}

export async function updateCase(id: string, data: TablesUpdate<'cases'>, historyNote?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get current case to track status change
  const { data: currentCase } = await supabase.from('cases').select('status, case_code, partner_id').eq('id', id).single();

  const { error } = await supabase
    .from('cases')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Add history entry and notify partner if status changed
  if (data.status && currentCase?.status !== data.status) {
    await supabase.from('case_history').insert({
      case_id: id,
      old_status: currentCase?.status,
      new_status: data.status,
      notes: historyNote || 'Status updated',
    });

    // Notify the partner about the status change
    if (currentCase?.partner_id && currentCase.status) {
      notifyCaseStatusChanged({
        id,
        case_code: currentCase.case_code,
        partner_id: currentCase.partner_id,
        old_status: currentCase.status,
        new_status: data.status,
      }).catch(console.error);
    }
  }

  revalidatePath('/admin/cases');
  revalidatePath(`/admin/cases/${id}`);
  return { success: true };
}

export async function deleteCase(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Delete related records first
  await supabase.from('case_history').delete().eq('case_id', id);
  await supabase.from('case_documents').delete().eq('case_id', id);

  const { error } = await supabase.from('cases').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/cases');
  return { success: true };
}

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

export async function getAdminEvents(options: ListOptions & {
  eventType?: string;
  upcoming?: boolean;
}): Promise<PaginatedResult<Event>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'start_datetime', sortOrder = 'desc', eventType, upcoming } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('events').select('*', { count: 'exact' });

  // Apply filters
  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (upcoming) {
    query = query.gte('start_datetime', new Date().toISOString());
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin events:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminEvent(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function createEvent(data: TablesInsert<'events'>): Promise<{ success: boolean; error?: string; data?: Event }> {
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('events').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify all partners about the new event
  if (result) {
    notifyEventPublished({
      id: result.id,
      title: result.title,
      event_type: result.event_type,
      start_datetime: result.start_datetime,
    }).catch(console.error); // Non-blocking
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
  return { success: true, data: result };
}

export async function updateEvent(id: string, data: TablesUpdate<'events'>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath(`/events/${id}`);
  return { success: true };
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Delete registrations first
  await supabase.from('event_registrations').delete().eq('event_id', id);

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
  return { success: true };
}

// ============================================================================
// ACADEMY CONTENT MANAGEMENT
// ============================================================================

export async function getAdminAcademyContent(options: ListOptions & {
  contentType?: string;
  year?: number;
  published?: boolean;
}): Promise<PaginatedResult<AcademyContent>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', contentType, year, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('academy_content').select('*', { count: 'exact' });

  // Apply filters
  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  if (year) {
    query = query.eq('year', year);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,theme.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin academy content:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminAcademyItem(id: string): Promise<AcademyContent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('academy_content').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching academy item:', error);
    return null;
  }

  return data;
}

export async function createAcademyContent(data: TablesInsert<'academy_content'>): Promise<{ success: boolean; error?: string; data?: AcademyContent }> {
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('academy_content').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify partners if academy content is published
  if (result.is_published) {
    notifyAcademyContentPublished({
      id: result.id,
      title: result.title,
      content_type: result.content_type,
    }).catch(console.error);
  }

  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  return { success: true, data: result };
}

export async function updateAcademyContent(id: string, data: TablesUpdate<'academy_content'>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if content is being published for the first time
  if (data.is_published === true) {
    const { data: current } = await supabase.from('academy_content').select('is_published, title, content_type').eq('id', id).single();

    // Notify partners when content is newly published
    if (current?.is_published === false) {
      notifyAcademyContentPublished({
        id,
        title: data.title || current.title,
        content_type: data.content_type || current.content_type,
      }).catch(console.error);
    }
  }

  const { error } = await supabase
    .from('academy_content')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  return { success: true };
}

export async function deleteAcademyContent(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Delete completions first
  await supabase.from('content_completions').delete().eq('content_id', id);

  const { error } = await supabase.from('academy_content').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/academy');
  revalidatePath('/academy');
  return { success: true };
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export async function getAdminDocuments(options: ListOptions & {
  category?: string;
  published?: boolean;
}): Promise<PaginatedResult<Document>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', category, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('documents').select('*', { count: 'exact' });

  if (category) {
    query = query.eq('category', category);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin documents:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminDocument(id: string): Promise<Document | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data;
}

export async function createDocument(data: TablesInsert<'documents'>): Promise<{ success: boolean; error?: string; data?: Document }> {
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('documents').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify partners if document is published
  if (result.is_published) {
    notifyDocumentPublished({
      id: result.id,
      title: result.title,
      category: result.category,
    }).catch(console.error);
  }

  revalidatePath('/admin/documents');
  revalidatePath('/documents');
  return { success: true, data: result };
}

export async function updateDocument(id: string, data: TablesUpdate<'documents'>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if document is being published for the first time
  let wasPublished = false;
  if (data.is_published === true) {
    const { data: current } = await supabase.from('documents').select('is_published, title, category').eq('id', id).single();
    wasPublished = current?.is_published === false;

    // Notify partners when document is newly published
    if (wasPublished && current) {
      notifyDocumentPublished({
        id,
        title: data.title || current.title,
        category: data.category || current.category,
      }).catch(console.error);
    }
  }

  const { error } = await supabase
    .from('documents')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/documents');
  revalidatePath('/documents');
  return { success: true };
}

export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('documents').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/documents');
  revalidatePath('/documents');
  return { success: true };
}

// ============================================================================
// BLOG MANAGEMENT
// ============================================================================

export async function getAdminBlogPosts(options: ListOptions & {
  category?: string;
  published?: boolean;
}): Promise<PaginatedResult<BlogPost>> {
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', category, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('blog_posts').select('*', { count: 'exact' });

  if (category) {
    query = query.eq('category', category);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin blog posts:', error);
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminBlogPost(id: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

export async function createBlogPost(data: TablesInsert<'blog_posts'>): Promise<{ success: boolean; error?: string; data?: BlogPost }> {
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('blog_posts').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Notify partners if blog post is published
  if (result.is_published) {
    notifyBlogPostPublished({
      slug: result.slug,
      title: result.title,
    }).catch(console.error);
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return { success: true, data: result };
}

export async function updateBlogPost(id: string, data: TablesUpdate<'blog_posts'>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if blog post is being published for the first time
  if (data.is_published === true) {
    const { data: current } = await supabase.from('blog_posts').select('is_published, slug, title').eq('id', id).single();

    // Notify partners when blog post is newly published
    if (current?.is_published === false) {
      notifyBlogPostPublished({
        slug: data.slug || current.slug,
        title: data.title || current.title,
      }).catch(console.error);
    }
  }

  const { error } = await supabase
    .from('blog_posts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return { success: true };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function getPartnerOptions(): Promise<{ value: string; label: string }[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id, company_name, contact_first_name, contact_last_name')
    .eq('role', 'PARTNER')
    .eq('is_active', true)
    .order('company_name');

  return (data || []).map((p) => ({
    value: p.id,
    label: p.company_name || `${p.contact_first_name} ${p.contact_last_name}`.trim() || 'Unknown',
  }));
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('category')
    .eq('role', 'PARTNER')
    .not('category', 'is', null);

  const categories = new Set<string>();
  data?.forEach((p) => {
    if (p.category) categories.add(p.category);
  });

  return Array.from(categories).sort();
}
