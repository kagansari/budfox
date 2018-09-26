const API_ROOT = 'http://127.0.0.1:8000/api/';

const get = async (url) => {
  const res = await fetch(API_ROOT + url)
  if (!res.ok) {
    throw new Error(res)
  }
  return res.json()
}

export default { get }
