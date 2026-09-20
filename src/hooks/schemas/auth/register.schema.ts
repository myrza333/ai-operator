import z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Имя слишком короткое")
    .max(50, "Имя слишком длинное"),
  email: z
    .string()
    .email("Не правильный email")
    .max(60, "Email слишком длинный"),
  password: z.string().min(8, "Пароль должен быть не менее 8 цифр"),
});
