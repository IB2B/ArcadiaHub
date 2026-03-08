'use server';

import { createServiceSupabaseClient } from '@/lib/database/server';
import { logger } from '@/lib/logger';
import { notifyAdminsAccessRequestSubmitted } from '@/lib/services/notificationService';
import { sendAccessRequestReceivedEmail, sendAdminAlertEmail } from '@/lib/email';

interface AccessRequestData {
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_description: string;
  contact_photo_url?: string;
  company_name: string;
  legal_address: string;
  operational_address: string;
  business_phone: string;
  generic_email: string;
  pec: string;
  company_description: string;
  company_logo_url?: string;
}

/**
 * Submit an access request (public - no auth required)
 */
export async function submitAccessRequest(
  data: AccessRequestData
): Promise<{ success: boolean; error?: string; requestId?: string }> {
  try {
    const supabase = await createServiceSupabaseClient();

    const { data: result, error } = await supabase
      .from('access_requests')
      .insert({
        contact_first_name: data.contact_first_name,
        contact_last_name: data.contact_last_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        contact_description: data.contact_description,
        contact_photo_url: data.contact_photo_url || null,
        company_name: data.company_name,
        legal_address: data.legal_address,
        operational_address: data.operational_address,
        business_phone: data.business_phone,
        generic_email: data.generic_email,
        pec: data.pec,
        company_description: data.company_description,
        company_logo_url: data.company_logo_url || null,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error submitting access request:', { error });
      return { success: false, error: error.message };
    }

    notifyAdminsAccessRequestSubmitted({
      id: result.id,
      company_name: data.company_name,
      contact_email: data.contact_email,
      contact_first_name: data.contact_first_name,
      contact_last_name: data.contact_last_name,
    }).catch((e) => logger.error('Background notification failed', { error: e }));

    sendAccessRequestReceivedEmail({
      to: data.contact_email,
      firstName: data.contact_first_name,
      companyName: data.company_name,
    }).catch((e) => logger.error('Failed to send access request received email', { error: e }));

    sendAdminAlertEmail({
      subject: `New access request: ${data.company_name}`,
      body: `${data.contact_first_name} ${data.contact_last_name} (${data.contact_email}) submitted an access request for ${data.company_name}.`,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/access-requests`,
    }).catch((e) => logger.error('Failed to send admin alert email', { error: e }));

    return { success: true, requestId: result.id };
  } catch (error) {
    logger.error('Error submitting access request:', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit request',
    };
  }
}

/**
 * Upload a file for access request (public - uses service client to bypass RLS)
 */
export async function uploadAccessRequestFile(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'photo' | 'logo';

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided' };
    }

    const supabase = await createServiceSupabaseClient();

    const folder = type === 'photo' ? 'contact-photos' : 'company-logos';
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${timestamp}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from('access-requests')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logger.error('Error uploading file:', { error });
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('access-requests')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    logger.error('Error uploading file:', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}
