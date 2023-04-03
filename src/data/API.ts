class APIClass {
  _config: { user: null | { username: string; id: string } } = {
    user: null,
  }

  _url: string = 'https://3.127.195.30:4000'

  async signIn(username: string, password: string) {
    return await fetch(`${this._url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.log(res.statusText)
          // TODO error handling
        }
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  async loadUser(): Promise<undefined | { username: string; id: string }> {
    return await fetch(`${this._url}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.log(res.statusText)
          // TODO error handling
        }
      })
      .then((res) => res?.user)
      .catch((err) => {
        console.error(err)
      })
  }
}

const API = new APIClass()

export default API
