export interface Config {
  /**
   * The root application directory.
   *
   * This is where the application's routes and layouts should be defined.
   *
   * @default "./src/app"
   */
  appPath?: string;

  /**
   * The path to the entries file.
   *
   * @default "./src/entries.tsx"
   */
  entriesPath?: string;
}

export let defaultConfig: Config = {
  appPath: "./src/app",
  entriesPath: "./src/entries.tsx",
};

export function defineConfig(config: Config): Config {
  return { ...defaultConfig, ...config };
}
