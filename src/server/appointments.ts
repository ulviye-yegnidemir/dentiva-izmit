import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSession } from './session'

const bookingSchema = z.object({
  reference: z.string().regex(/^DNT-\d{4}-[A-Z0-9]{6}$/),
  treatment: z.enum(['İmplant', 'Diş Beyazlatma', 'Ortodonti', 'Kanal Tedavisi', 'Çocuk Diş Hekimliği', 'Muayene', 'Diğer']),
  doctor: z.enum(['Fark etmez / İlk müsait hekim', 'Dt. Aylin Demir', 'Dt. Emre Yılmaz', 'Dt. Selin Kaya']),
  appointmentDate: z.iso.date(),
  appointmentTime: z.enum(['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '15:00', '16:00', '17:00', '18:00']),
  patientName: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.email().max(180),
  note: z.string().max(500),
  consent: z.literal(true),
})

const filtersSchema = z.object({
  appointmentDate: z.string().optional(),
  doctor: z.string().optional(),
})
const statusSchema = z.object({
  id: z.uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
})
const idSchema = z.object({ id: z.uuid() })
const blockSchema = z.object({
  doctor: z.string().min(2).max(100),
  blockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blockTime: z.string().regex(/^\d{2}:\d{2}$/),
})

// Public visitor submission: insert only; no session, no row returned.
export const createAppointment = createServerFn({ method: 'POST' })
  .validator(bookingSchema)
  .handler(async ({ data }) => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
    }).format(new Date())
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date())
    if (data.appointmentDate < today || (data.appointmentDate === today && data.appointmentTime <= currentTime)) {
      return { success: false }
    }
    const { insertAppointment } = await import('./appointments.server')
    return insertAppointment(data)
  })

export const getAppointments = createServerFn({ method: 'GET' })
  .middleware([requireSession])
  .validator(filtersSchema)
  .handler(async ({ data }) => {
    const { listAppointments } = await import('./appointments.server')
    return listAppointments(data)
  })

export const setAppointmentStatus = createServerFn({ method: 'POST' })
  .middleware([requireSession])
  .validator(statusSchema)
  .handler(async ({ data }) => {
    const { updateAppointmentStatus } = await import('./appointments.server')
    return updateAppointmentStatus(data)
  })

export const deleteAppointment = createServerFn({ method: 'POST' })
  .middleware([requireSession])
  .validator(idSchema)
  .handler(async ({ data }) => {
    const { removeAppointment } = await import('./appointments.server')
    return removeAppointment(data.id)
  })

export const getAvailabilityBlocks = createServerFn({ method: 'GET' })
  .middleware([requireSession])
  .handler(async () => {
    const { listAvailabilityBlocks } = await import('./appointments.server')
    return listAvailabilityBlocks()
  })

export const addAvailabilityBlock = createServerFn({ method: 'POST' })
  .middleware([requireSession])
  .validator(blockSchema)
  .handler(async ({ data }) => {
    const { insertAvailabilityBlock } = await import('./appointments.server')
    return insertAvailabilityBlock(data)
  })

export const deleteAvailabilityBlock = createServerFn({ method: 'POST' })
  .middleware([requireSession])
  .validator(idSchema)
  .handler(async ({ data }) => {
    const { removeAvailabilityBlock } = await import('./appointments.server')
    return removeAvailabilityBlock(data.id)
  })
