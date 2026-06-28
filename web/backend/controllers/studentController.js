import prisma from '../utils/prisma.js';
import { createStudentSchema, updateStudentSchema } from '../validations/student.js';
import { z } from 'zod';

const statusChangeSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'EXPELLED', 'GRADUATED', 'TRANSFERRED']),
  reason: z.string().optional(),
}).refine(
  (data) => {
    if (data.status === 'SUSPENDED' || data.status === 'EXPELLED') {
      return !!data.reason && data.reason.trim().length > 0;
    }
    return true;
  },
  { message: 'Reason is mandatory when status is SUSPENDED or EXPELLED', path: ['reason'] },
);

/**
 * GET /api/v1/students
 *
 * Returns the list of students scoped to the current school.
 * Accessible by: Admin, Registrar
 */
export async function listStudents(req, res) {
  try {
    const students = await prisma.student.findMany();
    return res.json({ status: 'success', data: students });
  } catch (err) {
    console.error('listStudents error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch students' },
    });
  }
}

/**
 * GET /api/v1/students/:id
 *
 * Returns a single student by ID (scoped to school).
 */
export async function getStudent(req, res) {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }
    return res.json({ status: 'success', data: student });
  } catch (err) {
    console.error('getStudent error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch student' },
    });
  }
}

/**
 * POST /api/v1/students
 *
 * Creates a new student record under the authenticated user's school.
 * Automatically assigns schoolId from the JWT context.
 */
export async function createStudent(req, res) {
  const parsed = createStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const data = parsed.data;
    const schoolId = req.user.schoolId;

    const student = await prisma.student.create({
      data: {
        schoolId,
        studentId: `STU-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone || null,
        guardianEmail: data.guardianEmail || null,
        address: data.address,
        previousSchool: data.previousSchool || null,
      },
    });

    return res.status(201).json({ status: 'success', data: student });
  } catch (err) {
    console.error('createStudent error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create student' },
    });
  }
}

/**
 * PATCH /api/v1/students/:id
 *
 * Updates a student record (Admin only — status changes, edits).
 */
export async function updateStudent(req, res) {
  const parsed = updateStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const data = parsed.data;
    const updateData = { ...data };
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);

    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return res.json({ status: 'success', data: student });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }
    console.error('updateStudent error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update student' },
    });
  }
}

/**
 * DELETE /api/v1/students/:id
 *
 * Soft-deletes a student record (Admin only).
 */
export async function deleteStudent(req, res) {
  try {
    await prisma.student.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    return res.json({ status: 'success', data: null });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }
    console.error('deleteStudent error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete student' },
    });
  }
}

/**
 * PATCH /api/v1/students/:id/status
 *
 * Advances a student's lifecycle status with audit logging.
 * SUSPENDED/EXPELLED require a mandatory reason.
 */
export async function updateStudentStatus(req, res) {
  const parsed = statusChangeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message, fields: parsed.error.flatten().fieldErrors },
    });
  }

  try {
    const { status, reason } = parsed.data;

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }

    const oldValues = JSON.stringify({ status: student.status, statusChangeReason: student.statusChangeReason });

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { status, statusChangeReason: reason ?? null },
    });

    // Audit log
    const newValues = JSON.stringify({ status: updated.status, statusChangeReason: updated.statusChangeReason });
    await prisma.auditLog.create({
      data: {
        schoolId: req.user.schoolId,
        userId: req.user.userId,
        action: 'STUDENT_STATUS_CHANGE',
        entityType: 'Student',
        entityId: updated.id,
        oldValues,
        newValues,
        ipAddress: req.ip,
      },
    });

    return res.json({ status: 'success', data: updated });
  } catch (err) {
    console.error('updateStudentStatus error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update student status' },
    });
  }
}
