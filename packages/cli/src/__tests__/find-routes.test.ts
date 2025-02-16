import { describe, expect, test } from "bun:test";
import { findRoutes } from "../find-routes";

describe("findRoutes", () => {
  test("should return an empty array if no routes are found", async () => {
    let routes = await findRoutes("./src/app/");

    expect(routes).toEqual([]);
  });
});
