import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { existsSync } from "node:fs";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import nodeOs from "node:os";
import nodePath from "node:path";
import nodeProcess from "node:process";
import { downloadTemplate } from "giget";
import mri from "mri";

import { generateEntries } from "./entries-generation.js";
import { findRoutes } from "./find-routes.js";
import { type Config, defaultConfig } from "./index.js";

type SpawnOptions = Parameters<typeof spawn>[2];

function spawnAsync(
  command: string,
  args: Array<string>,
  options: SpawnOptions = {},
): Promise<{ stdout: string; stderr: string; status: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    let stdout = "";
    let stderr = "";

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("error", (error) => {
      console.error("Spawn error:", error);
      reject(error);
    });

    child.on("close", (code) => {
      console.log(`Process exited with code ${code}`);
      resolve({ stdout, stderr, status: code ?? 0 });
    });
  });
}

export interface FileSystemImpl {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<string[]>;
  readdirSync: typeof readdirSync;
  rmdir(path: string): Promise<void>;
  unlink(path: string): Promise<void>;
  cp(
    src: string,
    dest: string,
    options?: { recursive?: boolean },
  ): Promise<void>;
}

type CommandArg = "init" | "dev" | "build" | "help";

export type ParsedArgs = {
  _: Array<string>;
  [key: string]: string | boolean | Array<string>;
} & {
  [K in Exclude<string, "_">]: string | boolean;
};

export interface Logger {
  log(...messages: Array<any>): void;
}

export interface OsImpl {
  tmpdir(): string;
  homedir(): string;
}

export type ExecImpl = (
  command: string,
  options?: { cwd?: string },
) => Promise<{ stdout: string; stderr: string }>;

export interface ProcessImpl {
  cwd(): string;
}

export interface DefaultOptions {
  fileSystem?: FileSystemImpl;
  logger?: Logger;
  nodePath?: typeof import("node:path");
  nodeOs?: typeof import("node:os");
  spawn?: typeof spawnAsync;
  nodeProcess?: typeof import("node:process");
}

type RefinedDefaultOptions = Required<DefaultOptions>;

class InvalidCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCommandError";
  }
}

class InvalidOptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOptionError";
  }
}

class FailureError extends Error {
  stdout?: string;
  stderr?: string;
  constructor(message: string) {
    super(message);
    this.name = "FailureError";
  }
}

let defaultOptions: RefinedDefaultOptions = {
  fileSystem: {
    async readFile(path: string) {
      return readFile(path, "utf-8");
    },
    writeFile,
    exists(path: string) {
      return Promise.resolve(existsSync(path));
    },
    async mkdir(path: string, options?: { recursive?: boolean }) {
      await mkdir(path, options);
    },
    readdir,
    readdirSync,
    rmdir,
    unlink,
    cp,
  },
  logger: console,
  nodePath,
  nodeOs,
  spawn: spawnAsync,
  nodeProcess,
};

export class CLI {
  parsedArgs: ParsedArgs;
  fileSystem: RefinedDefaultOptions["fileSystem"];
  nodePath: RefinedDefaultOptions["nodePath"];
  nodeOs: RefinedDefaultOptions["nodeOs"];
  logger: RefinedDefaultOptions["logger"];
  spawn: RefinedDefaultOptions["spawn"];
  nodeProcess: RefinedDefaultOptions["nodeProcess"];

  config: Required<Config> | undefined;

  constructor(
    parsedArgs: ParsedArgs,
    {
      fileSystem = defaultOptions.fileSystem,
      logger = defaultOptions.logger,
      nodePath = defaultOptions.nodePath,
      nodeOs = defaultOptions.nodeOs,
      spawn = defaultOptions.spawn,
      nodeProcess = defaultOptions.nodeProcess,
    }: DefaultOptions = defaultOptions,
  ) {
    this.parsedArgs = parsedArgs;
    this.fileSystem = fileSystem || defaultOptions.fileSystem;
    this.logger = logger || defaultOptions.logger;
    this.nodePath = nodePath || defaultOptions.nodePath;
    this.nodeOs = nodeOs || defaultOptions.nodeOs;
    this.spawn = spawn || defaultOptions.spawn;
    this.nodeProcess = nodeProcess || defaultOptions.nodeProcess;
  }

  async run(): Promise<void> {
    let args = this.parsedArgs;
    let logger = this.logger;

    let command = args._[0] as CommandArg;

    switch (command) {
      case "init": {
        await this.init();
        break;
      }
      case "dev": {
        logger.log("Collecting routes...");
        await this.prepare();
        logger.log("Starting development server...");
        try {
          let { status, stderr, stdout } = await this.spawn(
            `bun`,
            ["waku", "dev"],
            {
              env: {
                ...process.env,
                VITE_EXPERIMENTAL_WAKU_ROUTER: "true",
              },
              stdio: ["inherit", "inherit", "inherit"],
              cwd: this.nodeProcess.cwd(),
            },
          );
          if (status !== 0) {
            let error = new FailureError(
              ["Failed to start development server", `Raw error:`, stderr].join(
                "\n",
              ),
            );
            error.stdout = stdout;
            error.stderr = stderr;
            throw error;
          }
          logger.log(stdout);
        } catch (e) {
          if (e instanceof FailureError) {
            let errorMessage = e.stderr;
            if (!errorMessage) {
              errorMessage = `See above for more details.`;
            }
            throw new FailureError(
              [
                "Failed to start development server",
                `Raw error:`,
                errorMessage,
              ].join("\n"),
            );
          }
          throw new FailureError(
            [
              "Failed to start development server",
              `Raw error:`,
              (e as Error).message,
            ].join("\n"),
          );
        }
        break;
      }
      case "build": {
        logger.log("Collecting routes...");
        await this.prepare();
        logger.log("Building project...");
        try {
          let { status, stderr, stdout } = await this.spawn(
            `bun`,
            ["waku", "build", "--with-cloudflare"],
            {
              cwd: this.nodeProcess.cwd(),
              stdio: ["inherit", "inherit", "inherit"],
              env: {
                ...process.env,
                VITE_EXPERIMENTAL_WAKU_ROUTER: "true",
              },
            },
          );
          if (status !== 0) {
            let error = new FailureError(
              ["Failed to build project - status", `Raw error:`, stderr].join(
                "\n",
              ),
            );
            error.stdout = stdout;
            error.stderr = stderr;
            throw error;
          }
          logger.log(stdout);
          logger.log("Build successful!");
        } catch (e) {
          if (e instanceof FailureError) {
            let errorMessage = e.stderr;
            if (!errorMessage) {
              errorMessage = `See above for more details.`;
            }
            throw new FailureError(
              ["Failed to build project", `Raw error:`, errorMessage].join(
                "\n",
              ),
            );
          }
          throw new FailureError(
            [
              "Failed to build project",
              `Raw error:`,
              (e as Error).message,
            ].join("\n"),
          );
        }
        break;
      }
      case "help": {
        logger.log(
          [
            "@garbanzo/cli:",
            "",
            "Usage:",
            "  garbanzo init  - Initialize a new Garbanzo project",
            "    Supported Options:",
            "      path (required): Either;",
            "        --path <path> - The path to initialize the project in",
            "        -p <path> - The path to initialize the project in",
            "        <path> - The path to initialize the project in",
            "  garbanzo dev   - Start the development server",
            "  garbanzo build - Build the project",
            "  garbanzo help  - Show this help message",
            "",
          ].join("\n"),
        );
        break;
      }
      default: {
        throw new InvalidCommandError(
          `Unknown command: ${command} provided, expected one of: ${[
            "init",
            "dev",
            "build",
            "help",
          ].join(", ")}`,
        );
      }
    }
  }

  async init(): Promise<void> {
    let logger = this.logger;
    let args = this.parsedArgs;

    let path = args.path || args.p || args._[1];
    // @TODO: Do we want to support initalizing within an existing dir? (default to process.cwd()?)
    if (!path || typeof path !== "string") {
      throw new InvalidOptionError(
        [
          "No path provided, you must provide a path of the directory you want to create the garbanzo app within.",
          "",
          "Can be provided as: ",
          " - `garbanzo init <path>`,",
          " - `garbanzo init --path <path>`,",
          " - `garbanzo init -p <path>`",
        ].join("\n"),
      );
    }

    let normalizedPath = this.nodePath.join(
      this.nodeProcess.cwd(),
      path.replace(/^~/, this.nodeOs.homedir()),
    );

    let exists = await this.fileSystem.exists(normalizedPath);
    if (exists) {
      throw new InvalidOptionError(
        `Path ${normalizedPath} already exists, please provide a different path.`,
      );
    }

    try {
      await downloadTemplate(`github:hamlim/garbanzo/apps/template`, {
        dir: normalizedPath,
      });
      logger.log(
        [
          `Garbanzo app initialized in ${normalizedPath}!`,
          "Next steps:",
          "",
          ` - cd ${path}`,
          ` - bun i`,
          ` - bun run dev`,
          "",
          "Remember to initalize the repo if you want!",
        ].join("\n"),
      );
    } catch (e) {
      throw new FailureError(
        [
          `Failed to initialize garbanzo app in ${normalizedPath}`,
          `Raw error:`,
          (e as Error).message,
        ].join("\n"),
      );
    }
  }

  async loadConfig(): Promise<Required<Config>> {
    if (!this.config) {
      let userConfig: Partial<Config> = {};
      try {
        userConfig = await import(
          this.nodePath.join(this.nodeProcess.cwd(), "garbanzo.config.mjs")
        ).then((m) => m.default);
      } catch (e) {
        // missing config file, using default config
        userConfig = {};
      }

      let config = {
        ...defaultConfig,
        ...userConfig,
      };
      this.config = config as Required<Config>;
    }

    return this.config;
  }

  // @TODO: think about how we can run this in parallel with the dev server
  // watching for file changes and re-generating the entries file
  async prepare(): Promise<void> {
    let config = await this.loadConfig();

    let { appPath, entriesPath } = config;

    let routeDefinitions = findRoutes(appPath, {
      fs: this.fileSystem,
    });

    // @TODO: Support way for user to customize route definitions???

    await this.fileSystem.writeFile(
      entriesPath,
      generateEntries(
        {
          appPath,
          routeDefinitions,
        },
        {
          nodePath: this.nodePath,
        },
      ),
    );
  }
}

export function init(): void {
  let parsedArgs = mri(process.argv.slice(2), {
    alias: {
      path: ["p"],
    },
  });

  let cli = new CLI(parsedArgs);

  cli.run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
