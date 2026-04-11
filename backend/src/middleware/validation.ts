import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(255).regex(/^[a-zA-Z0-9]+$/, {
        message: 'Username must not contain special characters.',
    }),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.',
    }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
