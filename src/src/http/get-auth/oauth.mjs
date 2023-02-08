import tiny from 'tiny-json-http'
const useMock = process.env.ARC_OAUTH_USE_MOCK
const includeProperties = JSON.parse(process.env.ARC_OAUTH_INCLUDE_PROPERTIES)

function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

export default async function oauth(req) {
  const data = {
    code: req.query.code,
    grant_type: 'authorization_code'
  }
  if (!useMock) {
    data.client_id = process.env.ARC_OAUTH_CLIENT_ID
    data.client_secret = process.env.ARC_OAUTH_CLIENT_SECRET
    data.redirect_uri = process.env.ARC_OAUTH_REDIRECT_URL
  }
  let result = await tiny.post({
    url: `${process.env.ARC_OAUTH_TOKEN_URI}`,
    headers: { Accept: 'application/json' },
    data
  })

  if ('id_token' in result.body) {
    const userInfo = parseJwt(result.body.id_token)
    return prepareOAuthObject(userInfo)
  }

  let token = result.body.access_token

  let userResult = await tiny.get({
    url: process.env.ARC_OAUTH_USER_INFO_URI,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })

  const providerUser = userResult.body
  return prepareOAuthObject(providerUser)
}

function prepareOAuthObject(providerUser) {
  const filteredDetails = {}
  includeProperties.forEach((i) => (filteredDetails[i] = providerUser[i]))
  return {
    oauth: {
      provider:
        process.env.ARC_OAUTH_USE_MOCK == 'true'
          ? 'mock'
          : process.env.ARC_OAUTH_PROVIDER,
      user: filteredDetails
    }
  }
}
