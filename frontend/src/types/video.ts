export interface Video {
  id: number;
  title: string;
  thumbnailPath?: string;
  playCount: number;
  importedAt: string;
  categories: string[];
}

export interface VideoDetail extends Video {
  filePath: string;
  durationSeconds: number;
  fileSizeBytes: number;
  lastPlayedAt?: string;
}
