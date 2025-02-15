export interface Config {
  /**
   * The root application directory.
   *
   * This is where the application's routes and layouts should be defined.
   *
   * @default "./src/app"
   */
  appDir?: string;
}

export function defineConfig(config: Config): Config {
  return config;
}
