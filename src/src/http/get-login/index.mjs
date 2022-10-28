import arc from '@architect/functions'
// eslint-disable-next-line import/no-unresolved
import { loginHref } from 'arc-plugin-oauth'

export const handler = arc.http.async(login)

async function login(req) {
  const href = loginHref(req)
  return {
    statusCode: 200,
    html: `<a href="${href}">Login with OAuth</a>`
  }
}
