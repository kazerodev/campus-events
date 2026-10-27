import { z } from 'zod';

export const idParams = z.object({
  id: z.coerce.number().int().positive()
});

// Messages are shown to end users in the frontend, so keep them human.
export const createEventBody = z.object({
  title: z.string({ error: 'Enter a title' }).trim().min(3, 'Use at least 3 characters').max(120, 'Use at most 120 characters'),
  description: z.string().trim().max(2000, 'Use at most 2000 characters').optional(),
  location: z.string({ error: 'Enter a location' }).trim().min(2, 'Enter a location').max(120, 'Use at most 120 characters'),
  startsAt: z.coerce.date({ error: 'Pick a date and time' }),
  capacity: z.number({ error: 'Enter a number of seats' }).int('Use a whole number').min(1, 'At least 1 seat').max(10000, 'At most 10 000 seats')
});

export const updateEventBody = createEventBody
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });

export const registrationBody = z.object({
  name: z.string({ error: 'Enter your name' }).trim().min(2, 'Enter your name (at least 2 characters)').max(100, 'Use at most 100 characters'),
  email: z.email('Enter a valid email address').toLowerCase()
});
