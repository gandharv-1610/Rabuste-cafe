const GOOGLE_CALENDAR_BASE_URL = 'https://calendar.google.com/calendar/render';

// Convert a JS Date (local) to Google Calendar datetime format: YYYYMMDDTHHmmssZ (UTC)
function formatForCalendar(date) {
  const iso = date.toISOString().replace(/[-:]/g, '').split('.')[0];
  return `${iso}Z`;
}

// Parse time strings like "10:00 AM", "3 PM", "15:30"
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hours: 9, minutes: 0 }; // default 09:00
  }

  const trimmed = timeStr.trim().toUpperCase();

  // 10:30 AM, 3 PM
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2] || '0', 10);
    const period = ampmMatch[3];

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // 15:30, 9, 09
  const h24Match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2] || '0', 10);
    return { hours, minutes };
  }

  return { hours: 9, minutes: 0 };
}

// Extract duration in hours from a string like "2 hours", "1.5h"
function parseDurationHours(duration) {
  if (typeof duration === 'number') return duration || 2;
  if (!duration || typeof duration !== 'string') return 2;
  const match = duration.match(/(\d+(\.\d+)?)/);
  if (!match) return 2;
  return parseFloat(match[1]) || 2;
}

/**
 * Build a Google Calendar URL for an event.
 *
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {Date} opts.startDate - date of the event (local Date)
 * @param {string} opts.timeString - human-readable time (e.g. "10:00 AM")
 * @param {string|number} opts.duration - duration in hours or a string like "2 hours"
 * @param {string} [opts.location]
 */
function buildGoogleCalendarUrl({
  title,
  description,
  startDate,
  timeString,
  duration,
  location = 'Rabuste Coffee Café',
}) {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    throw new Error('Invalid startDate for Google Calendar URL');
  }

  const { hours, minutes } = parseTimeString(timeString);

  // Construct local start datetime
  const startLocal = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const durationHours = parseDurationHours(duration);
  const endLocal = new Date(startLocal.getTime() + durationHours * 60 * 60 * 1000);

  const startStr = formatForCalendar(startLocal);
  const endStr = formatForCalendar(endLocal);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Workshop at Rabuste Coffee',
    details: description || '',
    location,
    dates: `${startStr}/${endStr}`,
  });

  return `${GOOGLE_CALENDAR_BASE_URL}?${params.toString()}`;
}

function buildGoogleCalendarUrlForWorkshop(workshop) {
  if (!workshop) {
    throw new Error('Workshop is required to build calendar URL');
  }

  return buildGoogleCalendarUrl({
    title: workshop.title,
    description: workshop.description,
    startDate: workshop.date,
    timeString: workshop.time,
    duration: workshop.duration,
    location: 'Rabuste Coffee Café',
  });
}

module.exports = {
  buildGoogleCalendarUrl,
  buildGoogleCalendarUrlForWorkshop,
};


