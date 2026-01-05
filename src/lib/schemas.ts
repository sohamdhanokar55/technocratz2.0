/**
 * Shared Zod schemas for form validation
 */
import { z } from "zod";

// Base member schema (for team members)
export const memberSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contact: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits (numbers only)"),
  branch: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
});

// Leader schema (includes institute)
export const leaderSchema = memberSchema.extend({
  institute: z.string().min(1, "Institute is required"),
});

// Team schema for events with multiple members
export const teamSchema = z.object({
  leader: leaderSchema,
  members: z.array(memberSchema).min(1, "At least one team member is required"),
});

// Single participant schema
export const singleParticipantSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contact: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits (numbers only)"),
  branch: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
  institute: z.string().min(1, "Institute is required"),
});

// Technical Mimic schema (exactly 3 members + 1 leader = 4 total)
export const technicalMimicSchema = z.object({
  leader: leaderSchema,
  members: z.array(memberSchema).length(3, "Technical Mimic requires exactly 3 team members"),
});

// Duo schema (1 leader + 1 member = 2 total)
export const duoSchema = z.object({
  leader: leaderSchema,
  members: z.array(memberSchema).length(1, "This event requires exactly 1 team member"),
});

export type MemberFormData = z.infer<typeof memberSchema>;
export type LeaderFormData = z.infer<typeof leaderSchema>;
export type TeamFormData = z.infer<typeof teamSchema>;
export type SingleParticipantFormData = z.infer<typeof singleParticipantSchema>;
export type TechnicalMimicFormData = z.infer<typeof technicalMimicSchema>;
export type DuoFormData = z.infer<typeof duoSchema>;

