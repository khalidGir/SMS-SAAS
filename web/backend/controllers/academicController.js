import prisma from '../utils/prisma.js';
import { z } from 'zod';

const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(255),
  startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Valid start date required'),
  endDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Valid end date required'),
  isActive: z.boolean().optional().default(false),
});

const createTermSchema = z.object({
  academicSessionId: z.string().uuid('Invalid session ID'),
  name: z.string().min(1, 'Term name is required').max(255),
  startDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Valid start date required'),
  endDate: z.string().refine((v) => !isNaN(Date.parse(v)), 'Valid end date required'),
});

/**
 * POST /api/v1/academic/sessions
 *
 * Creates a new academic session. If isActive is true, deactivates all
 * other sessions for the same school in a transaction.
 */
export async function createSession(req, res) {
  const parsed = createSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
    });
  }

  try {
    const { name, startDate, endDate, isActive } = parsed.data;
    const schoolId = req.user.schoolId;

    const session = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.academicSession.updateMany({
          where: { schoolId, status: 'Active' },
          data: { status: 'Inactive' },
        });
      }

      return tx.academicSession.create({
        data: {
          schoolId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: isActive ? 'Active' : 'Inactive',
        },
      });
    });

    return res.status(201).json({ status: 'success', data: session });
  } catch (err) {
    console.error('createSession error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' },
    });
  }
}

/**
 * GET /api/v1/academic/sessions
 *
 * Lists all sessions for the school with nested terms.
 */
export async function listSessions(req, res) {
  try {
    const sessions = await prisma.academicSession.findMany({
      include: { terms: true },
      orderBy: { startDate: 'desc' },
    });
    return res.json({ status: 'success', data: sessions });
  } catch (err) {
    console.error('listSessions error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sessions' },
    });
  }
}

/**
 * PATCH /api/v1/academic/sessions/:id/activate
 *
 * Sets one session as Active, all others as Inactive for the school.
 */
export async function activateSession(req, res) {
  try {
    const schoolId = req.user.schoolId;
    const sessionId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      await tx.academicSession.updateMany({
        where: { schoolId, status: 'Active' },
        data: { status: 'Inactive' },
      });

      return tx.academicSession.update({
        where: { id: sessionId },
        data: { status: 'Active' },
      });
    });

    return res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('activateSession error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to activate session' },
    });
  }
}

/**
 * POST /api/v1/academic/terms
 *
 * Creates a term bound to an academic session.
 */
export async function createTerm(req, res) {
  const parsed = createTermSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
    });
  }

  try {
    const { academicSessionId, name, startDate, endDate } = parsed.data;

    const term = await prisma.term.create({
      data: {
        academicSessionId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return res.status(201).json({ status: 'success', data: term });
  } catch (err) {
    console.error('createTerm error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create term' },
    });
  }
}
