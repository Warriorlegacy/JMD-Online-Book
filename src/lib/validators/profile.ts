// lib/validators/profile.ts

const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

export function isValidUpiId(s: string): boolean {
  return UPI_REGEX.test(s)
}

export function isValidIfsc(s: string): boolean {
  return IFSC_REGEX.test(s)
}
