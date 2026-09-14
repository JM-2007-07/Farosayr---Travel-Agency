import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  // Minimum-length only for the complexity policy — this is a foundation
  // phase, not a full password policy (breach-list checks, etc. are a
  // later concern if ever needed). Max length IS worth enforcing though:
  // bcrypt silently truncates input at 72 bytes regardless, so anything
  // beyond that adds no real strength, and rejecting it early is simpler
  // than letting an arbitrarily long string flow through unbounded.
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});
