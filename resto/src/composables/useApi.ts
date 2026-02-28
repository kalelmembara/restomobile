// =============================================================
// GANTI URL INI sesuai posisi folder api/ di server Anda
// XAMPP default: http://localhost/api/endpoints
// =============================================================
const BASE = 'http://localhost/api/endpoints'

export function useApi() {
  async function req(ep: string, method = 'GET', body?: any) {
    const url = (method === 'DELETE' && body?.id)
      ? `${BASE}/${ep}?id=${body.id}`
      : `${BASE}/${ep}`
    const opt: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
    if (body && method !== 'DELETE') opt.body = JSON.stringify(body)
    try {
      const r = await fetch(url, opt)
      return r.json()
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server. Pastikan XAMPP berjalan dan folder api/ sudah di htdocs.' }
    }
  }

  return {
    get:  (ep: string)              => req(ep),
    post: (ep: string, body: any)   => req(ep, 'POST', body),
    put:  (ep: string, body: any)   => req(ep, 'PUT',  body),
    del:  (ep: string, id: number)  => req(ep, 'DELETE', { id }),
  }
}
