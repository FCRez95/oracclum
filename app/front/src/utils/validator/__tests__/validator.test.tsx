import { validator } from "../validator";

describe("validator", () => {
  describe("login schema", () => {
    it("should validate successfully with valid login data", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "Validpass1@");

      const result = await validator("login", formData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: "user@example.com",
        password: "Validpass1@",
      });
    });

    it("should fail with invalid email format", async () => {
      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("password", "validpass");

      const result = await validator("login", formData);
      expect(result.success).toBe(false);
      if (
        result.errors &&
        "email" in result.errors &&
        Array.isArray((result.errors as { email?: string[] }).email)
      ) {
        expect((result.errors as { email: string[] }).email[0]).toBe(
          "Email inválido"
        );
      } else {
        throw new Error("Expected email error to be present");
      }
    });

    it("should fail with short password", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "123");

      const result = await validator("login", formData);
      expect(result.success).toBe(false);
      if (
        result.errors &&
        "password" in result.errors &&
        Array.isArray((result.errors as { password?: string[] }).password)
      ) {
        expect((result.errors as { password: string[] }).password[0]).toBe(
          "Mínimo de 8 caracteres"
        );
      } else {
        throw new Error("Expected password error to be present");
      }
    });
    it("should fail with long password", async () => {
      const formData = new FormData();
      formData.set("email", "user@example.com");
      formData.set("password", "123123123123456789!123456789!123456789!");

      const result = await validator("login", formData);
      expect(result.success).toBe(false);
      if (
        result.errors &&
        "password" in result.errors &&
        Array.isArray((result.errors as { password?: string[] }).password)
      ) {
        expect((result.errors as { password: string[] }).password[0]).toBe(
          "Máximo de 20 caracteres"
        );
      } else {
        throw new Error("Expected password error to be present");
      }
    });
  });

  describe("createUser schema", () => {
    it("should validate successfully with strong password", async () => {
      const formData = new FormData();
      formData.set("email", "newuser@example.com");
      formData.set("username", "newusername");
      formData.set("password", "StrongP@ss1");

      const result = await validator("createUser", formData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: "newuser@example.com",
        username: "newusername",
        password: "StrongP@ss1",
      });
    });

    it("should fail with weak password missing uppercase", async () => {
      const formData = new FormData();
      formData.set("email", "newuser@example.com");
      formData.set("username", "newusername");
      formData.set("password", "weakp@ss1");

      const result = await validator("createUser", formData);
      expect(result.success).toBe(false);
      if (
        result.errors &&
        "password" in result.errors &&
        Array.isArray((result.errors as { password?: string[] }).password)
      ) {
        expect((result.errors as { password: string[] }).password).toContain(
          "Deve conter um caracter maiúsculo"
        );
      } else {
        throw new Error("Expected password error to be present");
      }
    });
  });

  describe("editCampaign schema", () => {
    it("should validate successfully with all valid fields", async () => {
      const formData = new FormData();
      formData.set("campaignName", "My Campaign");
      formData.set("campaignLink", "https://example.com");
      formData.set("conversion_name", "purchase");
      formData.set("external_id", "12345");

      const result = await validator("editCampaign", formData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        campaignName: "My Campaign",
        campaignLink: "https://example.com",
        conversion_name: "purchase",
        external_id: "12345",
      });
    });

    it("should fail with empty conversion_name", async () => {
      const formData = new FormData();
      formData.set("campaignName", "My Campaign");
      formData.set("campaignLink", "https://example.com");
      formData.set("conversion_name", "");
      formData.set("external_id", "12345");

      const result = await validator("editCampaign", formData);
      expect(result.success).toBe(false);
      if (
        result.errors &&
        "conversion_name" in result.errors &&
        Array.isArray((result.errors as { conversion_name?: string[] }).conversion_name)
      ) {
        expect((result.errors as { conversion_name: string[] }).conversion_name[0]).toBe(
          "Nome da conversão é obrigatório"
        );
      } else {
        throw new Error("Expected conversion_name error to be present");
      }
    });
  });
});
