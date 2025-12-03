const API_BASE = '/api'  // 使用代理，不需要写完整URL

export async function get(url, params = {}) {
    const query = new URLSearchParams(params).toString()
    const fullUrl = query ? `${API_BASE}${url}?${query}` : `${API_BASE}${url}`

    const response = await fetch(fullUrl)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
}

export async function post(url, data = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    return await response.json()
}

export default { get, post }