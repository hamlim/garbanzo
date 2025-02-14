import {
  exists,
  mkdir,
  readFile,
  readdir,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";

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

export interface DefaultOptions {
  fileSystem?: FileSystemImpl;
  logger?: Logger;
}

type RefinedDefaultOptions = Required<DefaultOptions>;

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
};

export class CLI {
  parsedArgs: ParsedArgs;
  fileSystem: FileSystemImpl;
  logger: Logger;

  constructor(
    parsedArgs: ParsedArgs,
    {
      fileSystem = defaultOptions.fileSystem,
      logger = defaultOptions.logger,
    }: DefaultOptions = defaultOptions,
  ) {
    this.parsedArgs = parsedArgs;
    this.fileSystem = fileSystem || defaultOptions.fileSystem;
    this.logger = logger || defaultOptions.logger;
  }

  async run(): Promise<void> {
    let args = this.parsedArgs;
    let logger = this.logger;

    // TODO
    let command = args._[0] as CommandArg;

    switch (command) {
      case "init": {
        // TODO: clone template
        break;
      }
      case "dev": {
        // TODO:
        break;
      }
      case "build": {
        // TODO:
        break;
      }
      case "help":
      default: {
        logger.log(
          [
            "@garbanzo/cli:",
            "",
            "Usage:",
            "  garbanzo init  - Initialize a new Garbanzo project",
            "  garbanzo dev   - Start the development server",
            "  garbanzo build - Build the project",
            "  garbanzo help  - Show this help message",
            "",
          ].join("\n"),
        );
        break;
      }
    }
  }
}
