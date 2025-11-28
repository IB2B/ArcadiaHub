import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log('Starting seed...');

  // 1. Create test users
  console.log('Creating test users...');

  // Create admin user
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: 'admin@arcadiahub.com',
    password: 'Admin123!',
    email_confirm: true,
  });

  if (adminAuthError && !adminAuthError.message.includes('already')) {
    console.error('Error creating admin:', adminAuthError);
  } else if (adminAuth?.user) {
    await supabase.from('profiles').update({
      role: 'ADMIN',
      company_name: 'Harlock',
      contact_first_name: 'Admin',
      contact_last_name: 'User',
    }).eq('id', adminAuth.user.id);
    console.log('Admin user created:', adminAuth.user.email);
  }

  // Create partner user
  const { data: partnerAuth, error: partnerAuthError } = await supabase.auth.admin.createUser({
    email: 'partner@test.com',
    password: 'Partner123!',
    email_confirm: true,
  });

  let partnerId: string | null = null;

  if (partnerAuthError && !partnerAuthError.message.includes('already')) {
    console.error('Error creating partner:', partnerAuthError);
  } else if (partnerAuth?.user) {
    partnerId = partnerAuth.user.id;
    await supabase.from('profiles').update({
      role: 'PARTNER',
      company_name: 'Solar Italia S.r.l.',
      contact_first_name: 'Marco',
      contact_last_name: 'Rossi',
      phone: '+39 02 1234567',
      address: 'Via Roma 123',
      city: 'Milano',
      region: 'Lombardia',
      country: 'Italy',
      postal_code: '20100',
      category: 'Solar',
      website: 'https://solaritalia.it',
      description: 'Leading solar panel installer in Northern Italy',
      is_active: true,
    }).eq('id', partnerAuth.user.id);
    console.log('Partner user created:', partnerAuth.user.email);
  }

  // 2. Seed Events
  console.log('Creating events...');
  const events = [
    {
      title: 'Q4 Partner Webinar: New Product Launch',
      description: 'Join us for an exclusive preview of our new product lineup for Q4 2024. Learn about features, pricing, and marketing support.',
      event_type: 'WEBINAR',
      start_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      end_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location: 'Online - Zoom',
      meeting_link: 'https://zoom.us/j/123456789',
      is_published: true,
    },
    {
      title: 'Solar Installation Workshop',
      description: 'Hands-on training for advanced solar panel installation techniques. Limited seats available.',
      event_type: 'TRAINING',
      start_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      location: 'Harlock Training Center, Milano',
      is_published: true,
    },
    {
      title: 'Annual Partner Meeting 2024',
      description: 'Our annual gathering of partners to discuss strategy, share success stories, and network.',
      event_type: 'PHYSICAL',
      start_datetime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_datetime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      location: 'Grand Hotel, Roma',
      is_published: true,
    },
  ];

  for (const event of events) {
    const { error } = await supabase.from('events').insert(event);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating event:', error);
    }
  }
  console.log(`Created ${events.length} events`);

  // 3. Seed Academy Content
  console.log('Creating academy content...');
  const academyContent = [
    {
      title: 'Introduction to Solar Energy',
      description: 'A comprehensive introduction to solar energy technology and its applications.',
      content_type: 'VIDEO',
      thumbnail_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
      duration_minutes: 45,
      year: 2024,
      theme: 'Fundamentals',
      is_published: true,
    },
    {
      title: 'Sales Techniques for Energy Solutions',
      description: 'Learn effective sales strategies specifically designed for energy products.',
      content_type: 'VIDEO',
      thumbnail_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      duration_minutes: 60,
      year: 2024,
      theme: 'Sales',
      is_published: true,
    },
    {
      title: 'Product Catalog Q4 2024',
      description: 'Complete product catalog with specifications and pricing.',
      content_type: 'SLIDES',
      year: 2024,
      theme: 'Products',
      is_published: true,
    },
  ];

  for (const content of academyContent) {
    const { error } = await supabase.from('academy_content').insert(content);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating academy content:', error);
    }
  }
  console.log(`Created ${academyContent.length} academy items`);

  // 4. Seed Documents
  console.log('Creating documents...');
  const documents = [
    {
      title: 'Partner Agreement 2024',
      description: 'Official partner agreement document with terms and conditions.',
      category: 'CONTRACTS',
      file_url: '/documents/partner-agreement-2024.pdf',
      file_type: 'application/pdf',
      is_published: true,
    },
    {
      title: 'Brand Guidelines',
      description: 'Official brand guidelines including logos, colors, and typography.',
      category: 'BRAND_KIT',
      file_url: '/documents/brand-guidelines.pdf',
      file_type: 'application/pdf',
      is_published: true,
    },
    {
      title: 'Sales Presentation Template',
      description: 'Ready-to-use presentation template for client meetings.',
      category: 'PRESENTATIONS',
      file_url: '/documents/sales-presentation.pptx',
      file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      is_published: true,
    },
    {
      title: 'Marketing Materials Pack',
      description: 'Collection of brochures, flyers, and digital assets.',
      category: 'MARKETING',
      file_url: '/documents/marketing-pack.zip',
      file_type: 'application/zip',
      is_published: true,
    },
  ];

  for (const doc of documents) {
    const { error } = await supabase.from('documents').insert(doc);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating document:', error);
    }
  }
  console.log(`Created ${documents.length} documents`);

  // 5. Seed Cases for partner
  if (partnerId) {
    console.log('Creating cases...');
    const cases = [
      {
        case_code: '2024-0001',
        partner_id: partnerId,
        client_name: 'Bianchi Energia',
        status: 'IN_PROGRESS',
        notes: 'Installation of 10kW solar system for residential property.',
      },
      {
        case_code: '2024-0002',
        partner_id: partnerId,
        client_name: 'Verde Solutions',
        status: 'PENDING',
        notes: 'Quote request for commercial building energy audit.',
      },
      {
        case_code: '2024-0003',
        partner_id: partnerId,
        client_name: 'Casa Sole',
        status: 'COMPLETED',
        notes: 'Successfully installed 5kW system with battery storage.',
      },
    ];

    for (const caseItem of cases) {
      const { error } = await supabase.from('cases').insert(caseItem);
      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating case:', error);
      }
    }
    console.log(`Created ${cases.length} cases`);

    // 6. Seed Notifications for partner
    console.log('Creating notifications...');
    const notifications = [
      {
        user_id: partnerId,
        title: 'Welcome to Arcadia Hub!',
        message: 'Your partner account has been activated. Explore the platform to get started.',
        type: 'INFO',
        is_read: false,
      },
      {
        user_id: partnerId,
        title: 'New Event: Q4 Partner Webinar',
        message: 'Don\'t miss our upcoming webinar on new product launches.',
        type: 'EVENT',
        link: '/events',
        is_read: false,
      },
      {
        user_id: partnerId,
        title: 'Case Update: 2024-0001',
        message: 'Your case for Bianchi Energia has been moved to In Progress.',
        type: 'CASE_UPDATE',
        link: '/cases',
        is_read: false,
      },
    ];

    for (const notification of notifications) {
      const { error } = await supabase.from('notifications').insert(notification);
      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating notification:', error);
      }
    }
    console.log(`Created ${notifications.length} notifications`);
  }

  // 7. Seed lookup tables
  console.log('Creating lookup data...');

  const categories = [
    { name: 'Solar', slug: 'solar' },
    { name: 'Wind', slug: 'wind' },
    { name: 'Energy Storage', slug: 'energy-storage' },
    { name: 'EV Charging', slug: 'ev-charging' },
  ];

  const services = [
    { name: 'Installation', description: 'Product installation services' },
    { name: 'Maintenance', description: 'Ongoing maintenance and support' },
    { name: 'Consulting', description: 'Energy consulting services' },
  ];

  const certifications = [
    { name: 'Certified Installer', description: 'Official Harlock installer certification' },
    { name: 'Sales Expert', description: 'Advanced sales certification' },
    { name: 'Technical Specialist', description: 'Technical expertise certification' },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').insert(cat);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating category:', error);
    }
  }

  for (const svc of services) {
    const { error } = await supabase.from('services').insert(svc);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating service:', error);
    }
  }

  for (const cert of certifications) {
    const { error } = await supabase.from('certifications').insert(cert);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error creating certification:', error);
    }
  }

  console.log('Lookup data created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@arcadiahub.com / Admin123!');
  console.log('  Partner: partner@test.com / Partner123!');
}

seed().catch(console.error);
