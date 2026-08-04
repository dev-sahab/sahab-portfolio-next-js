export type MediaTypeFilter = 'image' | 'audio' | 'video' | 'document' | 'spreadsheet' | 'archive'

const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
const SPREADSHEET_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
const ARCHIVE_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip', 'application/x-tar']

export function mimeTypeMongoFilter(type: MediaTypeFilter): Record<string, any> {
  switch (type) {
    case 'image': return { mimeType: /^image\// }
    case 'audio': return { mimeType: /^audio\// }
    case 'video': return { mimeType: /^video\// }
    case 'document': return { mimeType: { $in: DOCUMENT_TYPES } }
    case 'spreadsheet': return { mimeType: { $in: SPREADSHEET_TYPES } }
    case 'archive': return { mimeType: { $in: ARCHIVE_TYPES } }
  }
}
