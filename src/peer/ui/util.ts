const baseUrl = new URL('/', document.URL).toString()
export function wrap(url: URL): URL {
  return new URL(`${baseUrl}?join=${encodeURIComponent(url.toString())}`)
}
