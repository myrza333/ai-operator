import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Не правильный email")
    .max(60, "Email слишком длинный"),
  password: z.string().min(8, "Пароль должен быть не менее 8 цифр"),
});
