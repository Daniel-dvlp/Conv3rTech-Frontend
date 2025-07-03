export const mockEmployees = [
  { id: 1, name: 'Daniela V.', color: '#F59E42', role: 'Técnico de Campo' },
  { id: 2, name: 'Carlos R.', color: '#3B82F6', role: 'Supervisor' },
  { id: 3, name: 'Ana G.', color: '#10B981', role: 'Técnico de Campo' },
  { id: 4, name: 'Luis P.', color: '#F43F5E', role: 'Técnico de Campo' },
];

export const mockShifts = [
  {
    id: 'shift-1',
    title: 'Daniela V.',
    start: '2025-07-07T08:00:00',
    end: '2025-07-07T17:00:00',
    rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20251231T235959Z',
    backgroundColor: '#F59E42',
    borderColor: '#F59E42',
    extendedProps: {
      employeeId: 1,
      role: 'Técnico de Campo'
    }
  },
  {
    id: 'shift-2',
    title: 'Carlos R.',
    start: '2025-07-07T08:00:00',
    end: '2025-07-07T17:00:00',
    rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20251231T235959Z',
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    extendedProps: {
      employeeId: 2,
      role: 'Supervisor'
    }
  },
]; 