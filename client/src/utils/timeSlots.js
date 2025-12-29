// Generate available time slots for pre-ordering
// Cafe hours: 11 AM - 11 PM
// Slots are 30 minutes apart
// Can only pre-order for 1 hour after current time

export const generateTimeSlots = () => {
  const slots = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Cafe opens at 11 AM (hour 11)
  const openHour = 11;
  // Cafe closes at 11 PM (hour 23)
  const closeHour = 23;
  
  // Calculate the earliest available slot (1 hour from now)
  const earliestSlot = new Date(now);
  earliestSlot.setHours(earliestSlot.getHours() + 1);
  earliestSlot.setMinutes(0);
  earliestSlot.setSeconds(0);
  earliestSlot.setMilliseconds(0);
  
  // If current time is before cafe opens, start from cafe opening time + 1 hour
  if (currentHour < openHour) {
    earliestSlot.setHours(openHour + 1);
    earliestSlot.setMinutes(0);
  }
  
  // If current time is after cafe closes, return empty array
  if (currentHour >= closeHour) {
    return [];
  }
  
  // Generate slots from earliest available to closing time
  const slotTime = new Date(earliestSlot);
  
  while (slotTime.getHours() < closeHour || (slotTime.getHours() === closeHour && slotTime.getMinutes() === 0)) {
    const slotEnd = new Date(slotTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);
    
    // Don't create slots that go past closing time
    if (slotEnd.getHours() > closeHour || (slotEnd.getHours() === closeHour && slotEnd.getMinutes() > 0)) {
      break;
    }
    
    const startHour12 = slotTime.getHours() % 12 || 12;
    const startMinute = slotTime.getMinutes().toString().padStart(2, '0');
    const startPeriod = slotTime.getHours() >= 12 ? 'PM' : 'AM';
    
    const endHour12 = slotEnd.getHours() % 12 || 12;
    const endMinute = slotEnd.getMinutes().toString().padStart(2, '0');
    const endPeriod = slotEnd.getHours() >= 12 ? 'PM' : 'AM';
    
    slots.push({
      value: `${startHour12}:${startMinute} ${startPeriod} - ${endHour12}:${endMinute} ${endPeriod}`,
      startTime: new Date(slotTime),
      endTime: new Date(slotEnd),
      display: `${startHour12}:${startMinute} ${startPeriod} - ${endHour12}:${endMinute} ${endPeriod}`
    });
    
    // Move to next 30-minute slot
    slotTime.setMinutes(slotTime.getMinutes() + 30);
  }
  
  return slots;
};

// Check if cafe is currently open
export const isCafeOpen = () => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= 11 && currentHour < 23;
};

