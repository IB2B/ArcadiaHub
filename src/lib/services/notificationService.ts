'use server';

import { createServiceSupabaseClient } from '@/lib/database/server';

// Must match DB constraint: CHECK (type IN ('INFO', 'CASE_UPDATE', 'EVENT', 'CONTENT', 'MENTION', 'SUGGESTION_REPLY'))
type NotificationType =
  | 'INFO'
  | 'CASE_UPDATE'
  | 'EVENT'
  | 'CONTENT'
  | 'MENTION'
  | 'SUGGESTION_REPLY';

type UserRole = 'ADMIN' | 'PARTNER' | 'COMMERCIAL';

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
  const supabase = await createServiceSupabaseClient();

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
  return getUsersByRole('PARTNER');
}

/**
 * Get all admin user IDs
 */
async function getAllAdmins(): Promise<string[]> {
  return getUsersByRole('ADMIN');
}

/**
 * Create notification for a single user
 */
async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  const supabase = await createServiceSupabaseClient();

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

  const supabase = await createServiceSupabaseClient();

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
    type: 'EVENT',
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
    type: 'EVENT',
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
    type: 'CASE_UPDATE',
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
    type: 'CASE_UPDATE',
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
    type: 'CASE_UPDATE',
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
    type: 'CASE_UPDATE',
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
    type: 'CONTENT',
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
    type: 'CONTENT',
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
    type: 'CONTENT',
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
  roles: UserRole[] = ['ADMIN', 'PARTNER', 'COMMERCIAL']
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
    type: 'INFO',
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
    type: 'INFO',
    link: `/admin/partners/${partner.id}`,
  });
}

// ============================================
// ACCESS REQUEST NOTIFICATIONS
// ============================================

// ============================================
// MENTION NOTIFICATIONS
// ============================================

/**
 * Notify a user when they are @mentioned in a comment
 */
export async function notifyUserMentioned(data: {
  mentionedUserId: string;
  authorName: string;
  entityType: string;
  entityTitle: string;
  entityLink: string;
  commentId: string;
  commentPreview?: string;
}): Promise<void> {
  const entityTypeLabels: Record<string, string> = {
    case: 'Case',
    blog_post: 'Blog Post',
    event: 'Event',
    academy_content: 'Academy',
  };

  const label = entityTypeLabels[data.entityType] || 'post';
  const preview = data.commentPreview ? ` · "${data.commentPreview}"` : '';

  await createNotification(data.mentionedUserId, {
    title: `${data.authorName} mentioned you`,
    message: `You were tagged in a comment on ${label}: "${data.entityTitle}"${preview}`,
    type: 'MENTION',
    link: `${data.entityLink}#comment-${data.commentId}`,
  });
}

// ============================================
// SUGGESTION NOTIFICATIONS
// ============================================

/**
 * Notify a user when an admin replies to their suggestion
 */
export async function notifySuggestionReply(data: {
  userId: string;
  suggestionSubject: string;
  suggestionId: string;
}): Promise<void> {
  await createNotification(data.userId, {
    title: 'Reply to your suggestion',
    message: `An admin replied to your suggestion: "${data.suggestionSubject}"`,
    type: 'SUGGESTION_REPLY',
    link: `/suggestions`,
  });
}

/**
 * Notify admins when a new suggestion is submitted
 */
export async function notifyAdminsSuggestionSubmitted(data: {
  userId: string;
  subject: string;
}): Promise<void> {
  const admins = await getAllAdmins();

  await createNotificationsForUsers(admins, {
    title: `New suggestion: ${data.subject}`,
    message: 'A partner has submitted a new suggestion.',
    type: 'INFO',
    link: `/admin/suggestions`,
  });
}

/**
 * Notify admins when a new access request is submitted
 */
export async function notifyAdminsAccessRequestSubmitted(request: {
  id: string;
  company_name: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
}): Promise<void> {
  const admins = await getAllAdmins();

  await createNotificationsForUsers(admins, {
    title: `New access request: ${request.company_name}`,
    message: `${request.contact_first_name} ${request.contact_last_name} (${request.contact_email}) has submitted an access request.`,
    type: 'INFO',
    link: `/admin/access-requests`,
  });
}
