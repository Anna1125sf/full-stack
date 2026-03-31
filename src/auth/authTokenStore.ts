const KEY = 'article-library:access-token'

export const authTokenStore = {
  get(): string | null {
    return localStorage.getItem(KEY)
  },
  set(token: string) {
    localStorage.setItem(KEY, token)
  },
  clear() {
    localStorage.removeItem(KEY)
  },
}

