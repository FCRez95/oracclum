import { z } from "zod";

const minLengthErrorMessage = "Mínimo de 8 caracteres";
const maxLengthErrorMessage = "Máximo de 20 caracteres";
const uppercaseErrorMessage = "Deve conter um caracter maiúsculo";
const lowercaseErrorMessage = "Deve conter um caracter minúsculo";
const numberErrorMessage = "Deve conter um número";
const specialCharacterErrorMessage = "Deve conter um caracter especial";
const invalidMailMessage = "Email inválido";
const invalidUrlMessage = "URL inválida";
const campaignNameMinLengthMessage = "Nome da campanha muito curto";
const campaignNameMaxLengthMessage = "Nome da campanha muito longo";

export const emailField = z.string().email({ message: invalidMailMessage });

export const passwordField = z
  .string()
  .min(8, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage })
  .refine((password) => /[A-Z]/.test(password), {
    message: uppercaseErrorMessage,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: lowercaseErrorMessage,
  })
  .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: specialCharacterErrorMessage,
  });

export const usernameField = z
  .string()
  .min(8, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage });

export const linkField = z.string().url({ message: invalidUrlMessage });

export const campaignNameField = z
  .string()
  .min(2, { message: campaignNameMinLengthMessage })
  .max(128, { message: campaignNameMaxLengthMessage });

export const nameField = z
  .string()
  .min(3, { message: "Nome muito curto" })
  .max(100, { message: "Nome muito longo" });

export const passwordConfirmationField = z.string();

export const cpfcnpjField = z
  .string()
  .regex(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, { message: "CPF/CNPJ inválido" });

export const phoneField = z
  .string()
  .regex(/^\(\d{2}\) \d{5}-\d{4}|\(\d{2}\) \d{4}-\d{4}$/, { message: "Telefone inválido - R" })
  .min(14, { message: "Telefone inválido - Min" })
  .max(15, { message: "Telefone inválido - Max" });

export const pixelIdField = z
  .string()
  .min(1, { message: "Pixel ID é obrigatório" });

export const pixelAccessTokenField = z
  .string()
  .min(1, { message: "Pixel Access Token é obrigatório" });
