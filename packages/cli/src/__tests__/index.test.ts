import { describe, expect, test } from "bun:test";
import { CLI, type DefaultOptions, type ParsedArgs } from "../index";

class TestLogger {
  logs: Array<any> = [];

  log(...messages: Array<any>) {
    this.logs.push(messages);
  }
}

describe("CLI", () => {
  test("should parse args", async () => {
    let testLogger = new TestLogger();

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
});
