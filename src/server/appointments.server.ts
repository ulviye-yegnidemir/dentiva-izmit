import '@tanstack/react-start/server-only'

import { and, asc, eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { db } from './db'
import { appointments, availabilityBlocks } from './schema'

export async function insertAppointment(data: {
  reference: string
  treatment: string
  doctor: string
  appointmentDate: string
  appointmentTime: string
  patientName: string
  phone: string
  email: string
  note: string
  consent: true
}) {
  const result = await db.execute(sql`
    INSERT INTO appointments
      (reference, treatment, doctor, appointment_date, appointment_time,
       patient_name, phone, email, note, consent)
    SELECT ${data.reference}, ${data.treatment}, ${data.doctor},
      ${data.appointmentDate}, ${data.appointmentTime}, ${data.patientName},
      ${data.phone}, ${data.email}, ${data.note}, ${data.consent}
    WHERE NOT EXISTS (
      SELECT 1 FROM availability_blocks
      WHERE block_date = ${data.appointmentDate}
        AND block_time = ${data.appointmentTime}
        AND doctor IN (${data.doctor}, '__all__')
    )
    ON CONFLICT DO NOTHING
    RETURNING 1
  `)
  return { success: result.rows.length === 1 }
}

export async function listAppointments(filters: {
  appointmentDate?: string | undefined
  doctor?: string | undefined
}) {
  const clauses = []
  if (filters.appointmentDate) {
    clauses.push(eq(appointments.appointmentDate, filters.appointmentDate))
  }
  if (filters.doctor) clauses.push(eq(appointments.doctor, filters.doctor))
  return db
    .select()
    .from(appointments)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime))
}

export async function updateAppointmentStatus(data: {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled'
}) {
  await db
    .update(appointments)
    .set({ status: data.status })
    .where(eq(appointments.id, data.id))
  return { success: true }
}

export async function removeAppointment(id: string) {
  await db.delete(appointments).where(eq(appointments.id, id))
  return { success: true }
}

export async function listAvailabilityBlocks() {
  return db
    .select()
    .from(availabilityBlocks)
    .orderBy(asc(availabilityBlocks.blockDate), asc(availabilityBlocks.blockTime))
}

export async function insertAvailabilityBlock(data: {
  doctor: string
  blockDate: string
  blockTime: string
}) {
  await db.insert(availabilityBlocks).values(data).onConflictDoNothing()
  return { success: true }
}

export async function removeAvailabilityBlock(id: string) {
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id))
  return { success: true }
}
