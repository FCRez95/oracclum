"use server";

import { z } from "zod";
import {
  emailField,
  passwordField,
  usernameField,
  linkField,
  campaignNameField,
  //nameField,
  passwordConfirmationField,
  //cpfcnpjField,
  phoneField,
} from "./schemas";

const schemas = {
  login: z.object({
    email: emailField,
    password: passwordField,
  }),
  createUser: z.object({
    email: emailField,
    username: usernameField,
    password: passwordField,
  }),
  signupUser: z
    .object({
      //name: nameField,
      email: emailField,
      password: passwordField,
      passwordConfirmation: passwordConfirmationField,
      //cpfcnpj: cpfcnpjField,
      phone: phoneField,
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Senhas não conferem",
      path: ["passwordConfirmation"],
    }),
  editCampaign: z.object({
    campaignName: campaignNameField,
    campaignLink: linkField,
    conversion_name: z.string().min(1, { message: "Nome da conversão é obrigatório" }),
    external_id: z.string().min(1, { message: "Selecione uma campanha" }),
  }),
  createCampaign: z.object({
    campaignName: campaignNameField,
    campaignLink: linkField,
    external_id: z.string().min(1, { message: "Selecione uma campanha" }),
  }),
  changePassword: z.object({
    currentPassword: passwordField,
    newPassword: passwordField,
    confirmNewPassword: passwordField,
  }),
};

type SchemaKey = keyof typeof schemas;

export async function validator(schemaKey: SchemaKey, formData: FormData) {
  const schema = schemas[schemaKey];

  const entries = Object.fromEntries(formData.entries());
  const validatedFields = schema.safeParse(entries);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: validatedFields.data,
  };
}
