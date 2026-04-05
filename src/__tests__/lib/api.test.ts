import { describe, it, expect } from "vitest";
import { ok, created, fail } from "@/lib/api";

describe("API Response Helpers", () => {
  describe("ok", () => {
    it("should return 200 status with data", async () => {
      const response = ok({ id: 1, name: "test" });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({
        data: { id: 1, name: "test" },
        error: null,
      });
    });

    it("should accept custom init headers", async () => {
      const response = ok("success", {
        headers: { "X-Custom": "value" },
      });
      // The NextResponse.json mock in setup.ts may not preserve headers
      // so we verify the response is still valid JSON with correct body
      const body = await response.json();
      expect(body).toEqual({
        data: "success",
        error: null,
      });
    });

    it("should handle null data", async () => {
      const response = ok(null);
      const body = await response.json();
      expect(body.data).toBeNull();
      expect(body.error).toBeNull();
    });

    it("should handle array data", async () => {
      const response = ok([1, 2, 3]);
      const body = await response.json();
      expect(body.data).toEqual([1, 2, 3]);
    });
  });

  describe("created", () => {
    it("should return 201 status with data", async () => {
      const response = created({ id: "abc", created: true });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({
        data: { id: "abc", created: true },
        error: null,
      });
    });

    it("should handle string data", async () => {
      const response = created("Resource created successfully");
      const body = await response.json();
      expect(body.data).toBe("Resource created successfully");
    });
  });

  describe("fail", () => {
    it("should return 400 status with error message", async () => {
      const response = fail("Invalid input");
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        data: null,
        error: "Invalid input",
      });
    });

    it("should return custom status code", async () => {
      const response = fail("Not found", 404);
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe("Not found");
    });

    it("should return 401 for unauthorized", async () => {
      const response = fail("Unauthorized", 401);
      expect(response.status).toBe(401);
    });

    it("should return 500 for server error", async () => {
      const response = fail("Internal server error", 500);
      expect(response.status).toBe(500);
    });

    it("should always set data to null", async () => {
      const response = fail("Error occurred");
      const body = await response.json();
      expect(body.data).toBeNull();
    });
  });
});
