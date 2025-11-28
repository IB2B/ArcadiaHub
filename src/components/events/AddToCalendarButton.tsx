'use client';

import { memo, useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface AddToCalendarButtonProps {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

const icons = {
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  google: (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  apple: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  outlook: (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.354.228-.588.228h-8.522v-6.95l1.675 1.238c.09.066.196.1.32.1s.23-.033.32-.1l6.794-5.013c.082-.06.143-.133.182-.22.038-.087.057-.18.057-.28v-.113c-.01-.16-.062-.293-.155-.4-.094-.107-.202-.16-.326-.16h-.085l-7.131 5.254-1.656-1.22V5.047h8.524c.234 0 .43.076.588.228.158.152.238.346.238.576v1.536zM14.652 24V10.869l-1.675 1.238c-.09.067-.196.1-.32.1s-.23-.033-.32-.1L5.543 7.094c-.082-.06-.143-.133-.182-.22-.038-.087-.057-.18-.057-.28V6.48c.01-.16.062-.293.155-.4.094-.107.202-.16.326-.16h.085l7.131 5.254 1.656-1.22V0h-13.5C.765 0 .392.137.117.41S-.15.986-.15 1.378v21.244c0 .392.123.724.367.997.245.273.578.41.999.41l13.436-.03z"/>
    </svg>
  ),
};

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function AddToCalendarButton({
  title,
  description = '',
  startDate,
  endDate,
  location = '',
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description,
      location: location,
      dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      subject: title,
      body: description,
      location: location,
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      path: '/calendar/action/compose',
      rru: 'addevent',
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateICSFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Arcadia Hub//Event//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const options = [
    {
      label: 'Google Calendar',
      icon: icons.google,
      onClick: () => window.open(generateGoogleCalendarUrl(), '_blank'),
    },
    {
      label: 'Apple Calendar',
      icon: icons.apple,
      onClick: generateICSFile,
    },
    {
      label: 'Outlook',
      icon: icons.outlook,
      onClick: () => window.open(generateOutlookUrl(), '_blank'),
    },
    {
      label: 'Download .ics',
      icon: icons.calendar,
      onClick: generateICSFile,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {icons.calendar}
        <span>Add to Calendar</span>
        {icons.chevronDown}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50 animate-slideUp">
          {options.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(AddToCalendarButton);
