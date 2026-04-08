export interface AssetsJson {
  project: {
    restore: { projectName: string; projectPath: string };
    frameworks: Record<
      string,
      { dependencies?: Record<string, { version: string; target: string }> }
    >;
  };
  targets: Record<
    string,
    Record<string, { dependencies?: Record<string, string> }>
  >;
  libraries: Record<string, unknown>;
}
