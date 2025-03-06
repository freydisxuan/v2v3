import { describe, it, expect } from "@jest/globals";

describe("validators", () => {
    describe("validateSlug", () => {
        it("validates input slug and returns successful if valid", () => {
            const slug = "string";

            const result = validateSlug(slug);
            expect(result.success).toBe(true);
            expect(result.data).toBe("string");
        })
        it("returns not successful if input was invalid", () => {
            const slug = "";

            const result = validateSlug(slug);
            expect(result.success).toBe(false);
        })
    })
})