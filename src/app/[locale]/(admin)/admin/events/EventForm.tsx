'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createEvent, updateEvent } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type Event = Tables<'events'>;

interface EventFormProps {
  eventData?: Event;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const EVENT_TYPES = ['training', 'workshop', 'webinar', 'physical'] as const;

export default function EventForm({ eventData }: EventFormProps) {
  const t = useTranslations('admin');
  const tEvents = useTranslations('admin.events');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!eventData;

  // Parse datetime for form inputs
  const parseDateTime = (datetime: string | null): { date: string; time: string } => {
    if (!datetime) {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: '09:00',
      };
    }
    const dt = new Date(datetime);
    return {
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().slice(0, 5),
    };
  };

  const startParsed = parseDateTime(eventData?.start_datetime || null);
  const endParsed = parseDateTime(eventData?.end_datetime || null);

  // Form state
  const [formData, setFormData] = useState({
    title: eventData?.title || '',
    description: eventData?.description || '',
    event_type: eventData?.event_type || 'training',
    start_date: startParsed.date,
    start_time: startParsed.time,
    end_date: endParsed.date,
    end_time: endParsed.time,
    location: eventData?.location || '',
    meeting_link: eventData?.meeting_link || '',
    recording_url: eventData?.recording_url || '',
    is_published: eventData?.is_published ?? false,
  });

  // Update field
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = tForm('required');
    }

    if (!formData.event_type) {
      newErrors.event_type = tForm('required');
    }

    if (!formData.start_date) {
      newErrors.start_date = tForm('required');
    }

    if (!formData.start_time) {
      newErrors.start_time = tForm('required');
    }

    // Validate end datetime is after start datetime
    if (formData.end_date && formData.end_time && formData.start_date && formData.start_time) {
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);
      if (end < start) {
        newErrors.end_date = tForm('invalidDateRange');
      }
    }

    // Validate meeting link if provided
    if (formData.meeting_link && !/^https?:\/\/.+/.test(formData.meeting_link)) {
      newErrors.meeting_link = tForm('invalidUrl');
    }

    // Validate recording URL if provided
    if (formData.recording_url && !/^https?:\/\/.+/.test(formData.recording_url)) {
      newErrors.recording_url = tForm('invalidUrl');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        const startDatetime = new Date(`${formData.start_date}T${formData.start_time}`).toISOString();
        const endDatetime = formData.end_date && formData.end_time
          ? new Date(`${formData.end_date}T${formData.end_time}`).toISOString()
          : null;

        if (isEditing && eventData) {
          const updateData: TablesUpdate<'events'> = {
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            location: formData.location || null,
            meeting_link: formData.meeting_link || null,
            recording_url: formData.recording_url || null,
            is_published: formData.is_published,
          };

          const result = await updateEvent(eventData.id, updateData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          const insertData: TablesInsert<'events'> = {
            title: formData.title,
            description: formData.description || null,
            event_type: formData.event_type,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            location: formData.location || null,
            meeting_link: formData.meeting_link || null,
            recording_url: formData.recording_url || null,
            is_published: formData.is_published,
          };

          const result = await createEvent(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            setTimeout(() => {
              router.push('/admin/events');
            }, 1500);
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        }
      } catch {
        setMessage({ type: 'error', text: tMessages('error') });
      }
    });
  };

  // Event type options
  const eventTypeOptions = EVENT_TYPES.map((type) => ({
    value: type,
    label: tEvents(`types.${type}`),
  }));

  return (
    <form onSubmit={handleSubmit}>
      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader title={tEvents('details')} />
          <CardContent className="space-y-4">
            <Input
              label={tEvents('eventTitle')}
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              required
            />
            <Select
              label={tEvents('eventType')}
              options={eventTypeOptions}
              value={formData.event_type}
              onChange={(e) => updateField('event_type', e.target.value)}
              error={errors.event_type}
              required
            />
            <Textarea
              label={tEvents('description')}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              placeholder="Event description..."
            />
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader title="Date & Time" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={tEvents('startDate')}
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                error={errors.start_date}
                required
              />
              <Input
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) => updateField('start_time', e.target.value)}
                error={errors.start_time}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={tEvents('endDate')}
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                error={errors.end_date}
              />
              <Input
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={(e) => updateField('end_time', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Links */}
        <Card>
          <CardHeader title={tEvents('location')} />
          <CardContent className="space-y-4">
            <Input
              label="Physical Location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Address or venue name"
            />
            <Input
              label={tEvents('meetingLink')}
              type="url"
              value={formData.meeting_link}
              onChange={(e) => updateField('meeting_link', e.target.value)}
              error={errors.meeting_link}
              placeholder="https://..."
              hint="For online events"
            />
            <Input
              label={tEvents('recordingUrl')}
              type="url"
              value={formData.recording_url}
              onChange={(e) => updateField('recording_url', e.target.value)}
              error={errors.recording_url}
              placeholder="https://..."
              hint="Add after the event is complete"
            />
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardHeader title="Publishing" />
          <CardContent>
            <Toggle
              label={tEvents('isPublished')}
              description="Published events are visible to partners"
              checked={formData.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t('actions.cancel')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? t('actions.update') : t('actions.create')}
        </Button>
      </div>
    </form>
  );
}
