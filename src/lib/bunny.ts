// Загрузка файлов в Bunny Storage через обычный fetch, без SDK — у Bunny Storage
// нет presigned-URL как у S3, поэтому загрузка всегда идёт через сервер:
// ключ доступа не должен попасть в браузер.
export function bunnyConfigured(): boolean {
  return Boolean(process.env.BUNNY_STORAGE_ZONE && process.env.BUNNY_API_KEY && process.env.BUNNY_PULL_ZONE_URL)
}

export async function uploadToBunny(buffer: Buffer, path: string, contentType: string): Promise<string> {
  const zone = process.env.BUNNY_STORAGE_ZONE
  const apiKey = process.env.BUNNY_API_KEY
  const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL

  if (!zone || !apiKey || !pullZoneUrl) {
    throw new Error('Bunny storage is not configured (BUNNY_STORAGE_ZONE / BUNNY_API_KEY / BUNNY_PULL_ZONE_URL)')
  }

  const res = await fetch(`https://storage.bunnycdn.com/${zone}/${path}`, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': contentType
    },
    body: buffer as unknown as BodyInit
  })

  if (!res.ok) {
    throw new Error(`Bunny upload failed: ${res.status} ${await res.text().catch(() => '')}`)
  }

  return `${pullZoneUrl.replace(/\/$/, '')}/${path}`
}
