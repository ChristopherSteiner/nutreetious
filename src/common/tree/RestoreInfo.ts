export interface RestoreInfo {
  assetsPath: string;
  // ISO timestamp of the assets file's last modification — i.e. the last
  // restore. Null when the file's stats could not be read.
  restoredAt: string | null;
  packagesPath: string | null;
  configFilePaths: string[];
  sources: string[];
}
