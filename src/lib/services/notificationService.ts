'use server';

import { createClient } from '@/lib/database/server';

type NotificationType =
  | 'event_created'
  | 'event_updated'
  | 'case_created'
  | 'case_status_changed'
  | 'case_document_added'
  | 'document_published'
  | 'academy_content_published'
  | 'blog_post_published'
  | 'partner_registered'
  | 'system_announcement';

type UserRole = 'admin' | 'partner' | 'commercial';

interface NotificationPayload {
  title: string;
  message?: string;
  type: NotificationType;
  link?: string;
}

/**
 * Get all users by role
 */
async function getUsersByRole(role: UserRole): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', role);

  if (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }

  return data?.map(u => u.id) || [];
}

/**
 * Get all partner user IDs
 */
async function getAllPartners(): Promise<string[]> {
  return getUsersByRole('partner');
}

/**
 * Get all admin user IDs
 */
async function getAllAdmins(): Promise<string[]> {
  return getUsersByRole('admin');
}

/**
 * Create notification for a single user
 */
async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: payload.title,
      message: payload.message || null,
      type: payload.type,
      link: payload.link || null,
      is_read: false,
    });

  if (error) {
    console.error('Error creating notification:', error);
    return false;
  }

  return true;
}

/**
 * Create notifications for multiple users
 */
async function createNotificationsForUsers(
  userIds: string[],
  payload: NotificationPayload
): Promise<void> {
  if (userIds.length === 0) return;

  const supabase = await createClient();

  const notifications = userIds.map(userId => ({
    user_id: userId,
    title: payload.title,
    message: payload.message || null,
    type: payload.type,
    link: payload.link || null,
    is_read: false,
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating bulk notifications:', error);
  }
}

// ============================================
// EVENT NOTIFICATIONS
// ============================================

/**
 * Notify all partners when a new event is published
 */
export async function notifyEventPublished(event: {
  id: string;
  title: string;
  event_type: string;
  start_datetime: string;
}): Promise<void> {
  const partners = await getAllPartners();

  const eventDate = new Date(event.start_datetime).toLocaleDateString();

  await createNotificationsForUsers(partners, {
    title: `New ${event.event_type.toLowerCase()}: ${event.title}`,
    message: `A new event has been scheduled for ${eventDate}. Register now!`,
    type: 'event_created',
    link: `/events/${event.id}`,
  });
}

/**
 * Notify registered attendees when event is updated
 */
export async function notifyEventUpdated(event: {
  id: string;
  title: string;
}): Promise<void> {
  // For now, notify all partners - could be refined to only notify registered users
  const partners = await getAllPartners();

  await createNotificationsForUsers(partners, {
    title: `Event updated: ${event.title}`,
    message: 'The event details have been updated. Please check the latest information.',
    type: 'event_updated',
    link: `/events/${event.id}`,
  });
}

// ============================================
// CASE NOTIFICATIONS
// ============================================

/**
 * Notify partner when their case is created
 */
export async function notifyCaseCreated(caseData: {
  id: string;
  case_code: string;
  partner_id: string;
  client_name: string;
}): Promise<void> {
  await createNotification(caseData.partner_id, {
    title: `New case created: ${caseData.case_code}`,
    message: `A new case for ${caseData.client_name} has been created.`,
    type: 'case_created',
    link: `/cases/${caseData.id}`,
  });
}

/**
 * Notify partner when their case status changes
 */
export async function notifyCaseStatusChanged(caseData: {
  id: string;
  case_code: string;
  partner_id: string;
  old_status: string;
  new_status: string;
}): Promise<void> {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    suspended: 'Suspended',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  await createNotification(caseData.partner_id, {
    title: `Case ${caseData.case_code} status updated`,
    message: `Status changed from ${statusLabels[caseData.old_status] || caseData.old_status} to ${statusLabels[caseData.new_status] || caseData.new_status}.`,
    type: 'case_status_changed',
    link: `/cases/${caseData.id}`,
  });
}

/**
 * Notify partner when a document is added to their case
 */
export async function notifyCaseDocumentAdded(caseData: {
  case_id: string;
  case_code: string;
  partner_id: string;
  document_name: string;
}): Promise<void> {
  await createNotification(caseData.partner_id, {
    title: `New document for case ${caseData.case_code}`,
    message: `"${caseData.document_name}" has been added to your case.`,
    type: 'case_document_added',
    link: `/cases/${caseData.case_id}`,
  });
}

/**
 * Notify admins when a new case needs attention
 */
export async function notifyAdminsCaseCreated(caseData: {
  id: string;
  case_code: string;
  client_name: string;
}): Promise<void> {
  const admins = await getAllAdmins();

  await createNotificationsForUsers(admins, {
    title: `New case submitted: ${caseData.case_code}`,
    message: `A new case for ${caseData.client_name} requires review.`,
    type: 'case_created',
    link: `/admin/cases/${caseData.id}`,
  });
}

// ============================================
// DOCUMENT NOTIFICATIONS
// ============================================

/**
 * Notify all partners when a new document is published
 */
export async function notifyDocumentPublished(document: {
  id: string;
  title: string;
  category: string;
}): Promise<void> {
  const partners = await getAllPartners();

  const categoryLabels: Record<string, string> = {
    contracts: 'Contract',
    presentations: 'Presentation',
    brand_kit: 'Brand Kit',
    marketing: 'Marketing Material',
    guidelines: 'Guideline',
  };

  await createNotificationsForUsers(partners, {
    title: `New ${categoryLabels[document.category] || 'document'} available`,
    message: `"${document.title}" is now available in the documents section.`,
    type: 'document_published',
    link: '/documents',
  });
}

// ============================================
// ACADEMY NOTIFICATIONS
// ============================================

/**
 * Notify all partners when new academy content is published
 */
export async function notifyAcademyContentPublished(content: {
  id: string;
  title: string;
  content_type: string;
}): Promise<void> {
  const partners = await getAllPartners();

  const typeLabels: Record<string, string> = {
    video: 'video',
    gallery: 'photo gallery',
    slides: 'presentation',
    podcast: 'podcast',
    recording: 'recording',
  };

  await createNotificationsForUsers(partners, {
    title: `New academy ${typeLabels[content.content_type] || 'content'} available`,
    message: `Check out "${content.title}" in the Academy section.`,
    type: 'academy_content_published',
    link: '/academy',
  });
}

// ============================================
// BLOG NOTIFICATIONS
// ============================================

/**
 * Notify all partners when a new blog post is published
 */
export async function notifyBlogPostPublished(post: {
  slug: string;
  title: string;
}): Promise<void> {
  const partners = await getAllPartners();

  await createNotificationsForUsers(partners, {
    title: `New blog post: ${post.title}`,
    message: 'Read the latest news and updates from Harlock.',
    type: 'blog_post_published',
    link: `/blog/${post.slug}`,
  });
}

// ============================================
// SYSTEM NOTIFICATIONS
// ============================================

/**
 * Send a system announcement to all users
 */
export async function sendSystemAnnouncement(
  title: string,
  message: string,
  roles: UserRole[] = ['admin', 'partner', 'commercial']
): Promise<void> {
  const allUsers: string[] = [];

  for (const role of roles) {
    const users = await getUsersByRole(role);
    allUsers.push(...users);
  }

  // Remove duplicates
  const uniqueUsers = [...new Set(allUsers)];

  await createNotificationsForUsers(uniqueUsers, {
    title,
    message,
    type: 'system_announcement',
  });
}

/**
 * Notify admins of a new partner registration
 */
export async function notifyNewPartnerRegistration(partner: {
  id: string;
  company_name: string;
  email: string;
}): Promise<void> {
  const admins = await getAllAdmins();

  await createNotificationsForUsers(admins, {
    title: `New partner registration: ${partner.company_name}`,
    message: `${partner.email} has registered as a new partner.`,
    type: 'partner_registered',
    link: `/admin/partners/${partner.id}`,
  });
}
