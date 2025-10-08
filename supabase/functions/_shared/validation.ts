import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Email validation schema
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email format" })
  .max(255, { message: "Email must be less than 255 characters" });

// CPF validation schema (11 digits)
export const cpfSchema = z.string()
  .trim()
  .regex(/^\d{11}$/, { message: "CPF must be exactly 11 digits" })
  .refine(validateCPF, { message: "Invalid CPF" });

// Password validation schema
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" });

// Name validation schema
export const nameSchema = z.string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(255, { message: "Name must be less than 255 characters" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Name contains invalid characters" });

// CPF checksum validation
function validateCPF(cpf: string): boolean {
  // Remove any non-digit characters
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(digits[9])) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(digits[10])) return false;
  
  return true;
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes
