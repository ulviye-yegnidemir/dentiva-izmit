// The app's durable booking records and operator-managed unavailable slots.
export * from './auth-schema'
export * from './storage-schema'

import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const appointmentStatus = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'cancelled',
])

export const appointments = pgTable(
  'appointments',
  {
    id: uuid().primaryKey().defaultRandom(),
    reference: text().notNull().unique(),
    treatment: text().notNull(),
    doctor: text().notNull(),
    appointmentDate: date().notNull(),
    appointmentTime: time({ withTimezone: false }).notNull(),
    patientName: text().notNull(),
    phone: text().notNull(),
    email: text().notNull(),
    note: text().notNull().default(''),
    consent: boolean().notNull(),
    status: appointmentStatus().notNull().default('pending'),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('appointments_date_idx').on(table.appointmentDate),
    index('appointments_doctor_idx').on(table.doctor),
    uniqueIndex('appointments_active_slot_unique')
      .on(table.doctor, table.appointmentDate, table.appointmentTime)
      .where(sql`${table.status} <> 'cancelled'`),
  ],
)

export const availabilityBlocks = pgTable(
  'availability_blocks',
  {
    id: uuid().primaryKey().defaultRandom(),
    doctor: text().notNull(),
    blockDate: date().notNull(),
    blockTime: time({ withTimezone: false }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('availability_block_unique').on(
      table.doctor,
      table.blockDate,
      table.blockTime,
    ),
  ],
)
