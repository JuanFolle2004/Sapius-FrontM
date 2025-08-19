export interface Folder {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  parentFolderId?: string;
}
