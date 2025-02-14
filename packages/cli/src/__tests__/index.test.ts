import { beforeEach, describe, expect, test } from "bun:test";
import { CLI, type DefaultOptions, type ParsedArgs } from "../index";

class TestLogger {
  logs: Array<any> = [];

  log(...messages: Array<any>) {
    this.logs.push(messages);
  }
}

describe("CLI", () => {
  let testLogger: TestLogger;
  beforeEach(() => {
    testLogger = new TestLogger();
  });
  test("should parse args", async () => {
    let cli = new CLI(
      { _: ["help"] } as ParsedArgs,
      {
        logger: testLogger,
      } as DefaultOptions,
    );

    await cli.run();

    let logs = testLogger.logs.join("\n");

    expect(logs).toMatchSnapshot();
  });

  test("throws an error on invalid command", async () => {
    let cli = new CLI(
      {
        _: ["invalid-command"],
      } as ParsedArgs,
      {
        logger: testLogger,
      } as DefaultOptions,
    );

    expect(async () => await cli.run()).toThrowError("Unknown command");
  });

  test("init - throws error on missing path", async () => {
    let cli = new CLI(
      // no path provided
      { _: ["init"] } as ParsedArgs,
      { logger: testLogger } as DefaultOptions,
    );

    expect(async () => await cli.run()).toThrowError(
      "No path provided, you must provide a path of the directory you want to create the garbanzo app within.",
    );
  });
});
