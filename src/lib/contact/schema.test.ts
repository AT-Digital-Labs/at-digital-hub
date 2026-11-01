import { describe, expect, it } from "vitest";

import { CONTACT_LIMITS, validateContact } from "./schema";

const valid = {
  name: "  Alex   Rivera ",
  email: "alex@example.com",
  company: "",
  service: "web-development",
  message: "We need a customer portal for our team.",
};

describe("validateContact", () => {
  it("normalizes whitespace and accepts a complete inquiry", () => {
    const result = validateContact(valid);
    expect(result).toEqual({
      ok: true,
      data: { ...valid, name: "Alex Rivera" },
    });
  });

  it("reports every missing required field, but not the optional company", () => {
    const result = validateContact({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["email", "message", "name", "service"]);
    }
  });

  it.each(["not-an-email", "a@b", "a b@example.com", "x@example.com,y@example.com", "<x>@example.com"])(
    "rejects invalid email %j",
    (email) => {
      const result = validateContact({ ...valid, email });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.email).toBeDefined();
    },
  );

  it("rejects line breaks in single-line fields (header-injection shaped input)", () => {
    const result = validateContact({ ...valid, name: "Alex\r\nBcc: attacker@example.com" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeDefined();

    const company = validateContact({ ...valid, company: "Acme\nInc" });
    expect(company.ok).toBe(false);
  });

  it("enforces length limits and keeps the user's input for re-display", () => {
    const tooLong = "x".repeat(CONTACT_LIMITS.messageMax + 1);
    const result = validateContact({ ...valid, message: tooLong });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.message).toMatch(/under/);
      expect(result.values.name).toBe("Alex Rivera");
    }

    const short = validateContact({ ...valid, message: "hi" });
    expect(short.ok).toBe(false);
  });

  it("rejects services that are not in the allowed list", () => {
    const result = validateContact({ ...valid, service: "something-else" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.service).toBeDefined();
      expect(result.values.service).toBe("");
    }
  });

  it("ignores non-string values (e.g. file uploads or repeated keys)", () => {
    const result = validateContact({ ...valid, name: ["a", "b"], message: 42 });
    expect(result.ok).toBe(false);
  });

  it("allows newlines in the message body", () => {
    const result = validateContact({ ...valid, message: "Line one\nLine two is here" });
    expect(result.ok).toBe(true);
  });
});
