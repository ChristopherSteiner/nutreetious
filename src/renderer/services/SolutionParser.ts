export class SolutionParser {
  private constructor() {}

  static async getProjectPaths(
    slnPath: string,
    content: string,
  ): Promise<string[]> {
    if (slnPath.toLowerCase().endsWith('.slnx')) {
      return SolutionParser.parseSlnx(content);
    }
    return SolutionParser.parseSln(content);
  }

  private static parseSln(content: string): string[] {
    const projects: string[] = [];
    const projectRegex =
      /Project\("\{[\w-]+\}"\)\s*=\s*"[^"]+",\s*"([^"]+\.csproj)"/g;

    let match = projectRegex.exec(content);

    while (match !== null) {
      const path = match[1];
      if (path) {
        projects.push(SolutionParser.normalizePath(path));
      }
      match = projectRegex.exec(content);
    }

    return projects;
  }

  private static parseSlnx(content: string): string[] {
    const projects: string[] = [];
    const pathRegex = /<Project\s+Path="([^"]+\.csproj)"/g;

    let match = pathRegex.exec(content);

    while (match !== null) {
      const path = match[1];
      if (path) {
        projects.push(SolutionParser.normalizePath(path));
      }
      match = pathRegex.exec(content);
    }

    return projects;
  }

  private static normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
  }
}
