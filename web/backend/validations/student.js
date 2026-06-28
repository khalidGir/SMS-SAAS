import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select a valid gender option',
  }),
  guardianName: z.string().min(1, 'Guardian name is required').max(200),
  guardianPhone: z.string().max(20).optional().or(z.literal('')),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  previousSchool: z.string().max(255).optional(),
}).refine((data) => data.guardianPhone || data.guardianEmail, {
  message: 'Either Guardian Phone or Guardian Email must be provided',
  path: ['guardianPhone'],
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required',
  }).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select a valid gender option',
  }).optional(),
  guardianName: z.string().min(1).max(200).optional(),
  guardianPhone: z.string().max(20).optional().or(z.literal('')),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1).optional(),
  previousSchool: z.string().max(255).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'EXPELLED', 'GRADUATED', 'TRANSFERRED']).optional(),
  statusChangeReason: z.string().max(500).optional(),
});
