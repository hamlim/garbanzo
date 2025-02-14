import {
  exists,
  mkdir,
  readFile,
  readdir,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import nodePath from "node:path";

export interface FileSystemImpl {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  rmdir(path: string): Promise<void>;
  unlink(path: string): Promise<void>;
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

export interface NodePathImpl {
  join(...paths: Array<string>): string;
}

export interface DefaultOptions {
  fileSystem?: FileSystemImpl;
  logger?: Logger;
  nodePath?: NodePathImpl;
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

let defaultOptions: RefinedDefaultOptions = {
  fileSystem: {
    async readFile(path: string) {
      return readFile(path, "utf-8");
    },
    writeFile,
    exists,
    mkdir,
    readdir,
    rmdir,
    unlink,
  },
  logger: console,
  nodePath,
};

export class CLI {
  parsedArgs: ParsedArgs;
  fileSystem: FileSystemImpl;
  nodePath: NodePathImpl;
  logger: Logger;

  constructor(
    parsedArgs: ParsedArgs,
    {
      fileSystem = defaultOptions.fileSystem,
      logger = defaultOptions.logger,
      nodePath = defaultOptions.nodePath,
    }: DefaultOptions = defaultOptions,
  ) {
    this.parsedArgs = parsedArgs;
    this.fileSystem = fileSystem || defaultOptions.fileSystem;
    this.logger = logger || defaultOptions.logger;
    this.nodePath = nodePath || defaultOptions.nodePath;
  }

  async run(): Promise<void> {
    let args = this.parsedArgs;
    let logger = this.logger;

    let command = args._[0] as CommandArg;

    switch (command) {
      case "init": {
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

        let normalizedPath = this.nodePath.join(process.cwd(), path);

        // TODO: clone repo into normalizedPath
        // TODO: remove .git
        // TODO: install deps

        break;
      }
      case "dev": {
        // TODO: Check that this is a garbanzo app (presence of config file)
        // TODO: Scan root dir for garbanzo.config.mjs
        // TODO: load config
        // TODO: Search for routes/layouts/etc within config.rootDir
        // TODO: generate/update <rootDir>/entries.tsx
        // TODO: run dev server
        break;
      }
      case "build": {
        // TODO: Check that this is a garbanzo app (presence of config file)
        // TODO: Scan root dir for garbanzo.config.mjs
        // TODO: load config
        // TODO: Search for routes/layouts/etc within config.rootDir
        // TODO: generate/update <rootDir>/entries.tsx
        // TODO: run build
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
}
