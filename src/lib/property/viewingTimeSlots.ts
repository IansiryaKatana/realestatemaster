export const VIEWING_TIME_SLOTS = [
  { id: 'morning', label: 'Morning', hint: '9am – 12pm', time: '09:00:00' },
  { id: 'afternoon', label: 'Afternoon', hint: '12pm – 4pm', time: '13:00:00' },
  { id: 'evening', label: 'Evening', hint: '4pm – 7pm', time: '17:00:00' },
] as const

export type ViewingTimeSlotId = (typeof VIEWING_TIME_SLOTS)[number]['id']

export function viewingSlotTime(slotId: ViewingTimeSlotId): string {
  return VIEWING_TIME_SLOTS.find((slot) => slot.id === slotId)?.time ?? '09:00:00'
}

export function viewingTimeSlotLabel(time: string): string | null {
  const hour = Number(time.split(':')[0])
  if (Number.isNaN(hour)) return null
  if (hour < 12) return VIEWING_TIME_SLOTS[0].label + ' (9am – 12pm)'
  if (hour < 16) return VIEWING_TIME_SLOTS[1].label + ' (12pm – 4pm)'
  return VIEWING_TIME_SLOTS[2].label + ' (4pm – 7pm)'
}
