import { describe, expect, it } from "vitest";

import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("cannot be used to break out of the script element", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
