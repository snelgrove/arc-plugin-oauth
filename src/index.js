const { URL } = require('node:url')
const providers = require('./data/providers.json')

const PORT = process.env?.PORT ?? 3333

module.exports = {
  loginHref: function (req) {
    const redirectAfterAuth = req?.session?.redirectAfterAuth
    const redirectUrl = process.env.ARC_OAUTH_REDIRECT_URL
      ? process.env.ARC_OAUTH_REDIRECT_URL
      : ''
    if (process.env.ARC_OAUTH_USE_MOCK)
      return `http://localhost:${PORT}/mock/auth/login${
        redirectAfterAuth
          ? `?state=${encodeURIComponent(
              JSON.stringify({ redirectAfterAuth })
            )}`
          : ''
      }`
    else {
      const authUrl = new URL(process.env.ARC_OAUTH_AUTHORIZATION_URI)
      authUrl.searchParams.append('client_id', process.env.ARC_OAUTH_CLIENT_ID)
      authUrl.searchParams.append(
        'redirect_uri',
        process.env.ARC_OAUTH_REDIRECT_URL
      )
      authUrl.searchParams.append(
        'scope',
        process.env?.ARC_OAUTH_SCOPES ?? process.env.ARC_OAUTH_DEFAULT_SCOPES
      )
      authUrl.searchParams.append('state', redirectUrl)
      return authUrl.href
    }
  },
  checkAuth: function (req) {
    return req?.session?.account
  },
  authRedirect: function (redirect) {
    return function (req) {
      return authenticate(req, redirect)
    }
  },
  auth: function (req) {
    return authenticate(req, false)
  },
  set: {
    env: ({ arc }) => {
      const provider = arc.oauth.find((i) => i[0] == 'provider')?.[1]

      const afterAuthRedirect = arc.oauth.find(
        (i) => i[0] === 'after-auth-redirect'
      )?.[1]
      const customAuthorize = arc.oauth.find(
        (i) => i[0] === 'custom-authorize'
      )?.[1]
      const unAuthRedirect = arc.oauth.find(
        (i) => i[0] === 'un-auth-redirect'
      )?.[1]
      const matchProperty =
        arc.oauth.find((i) => i[0] === 'match-property')?.[1] || 'login'
      const includeProperties = arc.oauth.find(
        (i) => i[0] === 'include-properties'
      )
        ? JSON.stringify(
            arc.oauth.find((i) => i[0] === 'include-properties').slice(1)
          )
        : [matchProperty]
      const useMock = arc.oauth.find((i) => i[0] === 'use-mock')?.[1]
      const mockAllowList = arc.oauth.find((i) => i[0] === 'mock-list')
        ? arc.oauth.find((i) => i[0] === 'mock-list')[1]
        : 'mock-allow.mjs'
      const useAllowList = arc.oauth.find((i) => i[0] === 'allow-list')
      const allowList = useAllowList
        ? arc.oauth.find((i) => i[0] === 'allow-list')?.[1]
        : ''

      const routePrefix =
        arc.oauth.find((i) => i[0] === 'route-prefix')?.[1] ?? ''
      const loginUrl = new URL(
        `${routePrefix}/login`,
        `http://localhost:${PORT}`
      )
      const authUrl = new URL(`${routePrefix}/auth`, `http://localhost:${PORT}`)
      const testing = {
        ARC_OAUTH_PROVIDER: provider ? provider : 'github',
        ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
        ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
        ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect
          ? unAuthRedirect
          : loginUrl.pathname,
        ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
        ARC_OAUTH_MATCH_PROPERTY: matchProperty,
        ARC_OAUTH_USE_MOCK: useMock ? 'true' : '',
        ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
        ARC_OAUTH_ALLOW_LIST: allowList,
        ARC_OAUTH_ROUTE_PREFIX: routePrefix,
        ARC_OAUTH_AUTH_URI: authUrl.href,
        ARC_OAUTH_TOKEN_URI: providers[provider].endpoints.OAUTH_TOKEN_URI,
        ARC_OAUTH_USER_INFO_URI:
          providers[provider].endpoints.OAUTH_USER_INFO_URI,
        ARC_OAUTH_AUTHORIZATION_URI:
          providers[provider].endpoints.OAUTH_AUTHORIZATION_URI,
        ARC_OAUTH_DEFAULT_SCOPES: providers[provider].OAUTH_DEFAULT_SCOPES
      }
      if (useMock) {
        testing.ARC_OAUTH_TOKEN_URI = `http://localhost:${PORT}/mock/auth/token`
        testing.ARC_OAUTH_CODE_URI = `http://localhost:${PORT}/mock/auth/code`
        testing.ARC_OAUTH_USER_INFO_URI = `http://localhost:${PORT}/mock/auth/user`
        testing.ARC_OAUTH_MOCK_ALLOW_LIST = mockAllowList
      }
      return {
        testing,
        staging: {
          ARC_OAUTH_PROVIDER: provider ? provider : 'github',
          ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
          ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
          ARC_OAUTH_MATCH_PROPERTY: matchProperty,
          ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
          ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect
            ? unAuthRedirect
            : loginUrl.pathname,
          ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
          ARC_OAUTH_ALLOW_LIST: allowList,
          ARC_OAUTH_ROUTE_PREFIX: routePrefix,
          ARC_OAUTH_TOKEN_URI: providers[provider].endpoints.OAUTH_TOKEN_URI,
          ARC_OAUTH_USER_INFO_URI:
            providers[provider].endpoints.OAUTH_USER_INFO_URI,
          ARC_OAUTH_AUTHORIZATION_URI:
            providers[provider].endpoints.OAUTH_AUTHORIZATION_URI,
          ARC_OAUTH_DEFAULT_SCOPES: providers[provider].OAUTH_DEFAULT_SCOPES
        },
        production: {
          ARC_OAUTH_PROVIDER: provider ? provider : 'github',
          ARC_OAUTH_INCLUDE_PROPERTIES: includeProperties,
          ARC_OAUTH_CUSTOM_AUTHORIZE: customAuthorize ? customAuthorize : '',
          ARC_OAUTH_MATCH_PROPERTY: matchProperty,
          ARC_OAUTH_AFTER_AUTH: afterAuthRedirect ? afterAuthRedirect : '/',
          ARC_OAUTH_UN_AUTH_REDIRECT: unAuthRedirect
            ? unAuthRedirect
            : loginUrl.pathname,
          ARC_OAUTH_USE_ALLOW_LIST: useAllowList ? 'true' : '',
          ARC_OAUTH_ALLOW_LIST: allowList,
          ARC_OAUTH_ROUTE_PREFIX: routePrefix,
          ARC_OAUTH_TOKEN_URI: providers[provider].endpoints.OAUTH_TOKEN_URI,
          ARC_OAUTH_USER_INFO_URI:
            providers[provider].endpoints.OAUTH_USER_INFO_URI,
          ARC_OAUTH_AUTHORIZATION_URI:
            providers[provider].endpoints.OAUTH_AUTHORIZATION_URI,
          ARC_OAUTH_DEFAULT_SCOPES: providers[provider].OAUTH_DEFAULT_SCOPES
        }
      }
    },
    http: function ({ arc, inventory }) {
      const routePrefix =
        arc.oauth.find((i) => i[0] === 'route-prefix')?.[1] ?? ''
      const loginUrl = new URL(
        `${routePrefix}/login`,
        `http://localhost:${PORT}`
      )
      const logoutUrl = new URL(
        `${routePrefix}/logout`,
        `http://localhost:${PORT}`
      )
      const authUrl = new URL(`${routePrefix}/auth`, `http://localhost:${PORT}`)

      const specificRoutes = arc.oauth.find((i) => i[0] === 'routes') || false
      const useMock = arc.oauth.find((i) => i[0] === 'use-mock')?.[1]
      let endpoints = []
      if (!specificRoutes || specificRoutes.includes('auth'))
        endpoints.push({
          method: 'get',
          path: authUrl.pathname,
          config: { runtime: 'nodejs14.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-auth'
        })
      if (!specificRoutes || specificRoutes.includes('logout'))
        endpoints.push({
          method: 'post',
          path: logoutUrl.pathname,
          config: { runtime: 'nodejs14.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/post-logout'
        })
      if (!specificRoutes || specificRoutes.includes('login'))
        endpoints.push({
          method: 'get',
          path: loginUrl.pathname,
          config: { runtime: 'nodejs14.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-login'
        })
      if (useMock && !inventory.inv?._arc?.deployStage)
        endpoints.push({
          method: 'any',
          path: '/mock/auth/:part',
          config: { runtime: 'nodejs14.x' },
          src: './node_modules/arc-plugin-oauth/src/src/http/get-mock-auth-000part'
        })

      return endpoints
    }
  }
}

function authenticate(req, redirect) {
  const unAuthRedirect = process.env.ARC_OAUTH_UN_AUTH_REDIRECT || '/login'
  function isJSON(req) {
    let contentType = req.headers['Content-Type'] || req.headers['content-type']
    return /application\/json/gi.test(contentType)
  }
  const account = req?.session?.account

  if (!account) {
    if (isJSON(req)) {
      return {
        statusCode: 401
      }
    } else {
      return {
        statusCode: 302,
        headers: {
          'cache-control':
            'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
        },
        location: redirect ? redirect : unAuthRedirect
      }
    }
  } else {
    return false
  }
}
