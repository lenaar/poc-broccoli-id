const { openIdConfiguration } = require('./responses')

module.exports = {
  host: {
    address: '0.0.0.0',
    port: 3001,
  },
  paths: [
    {
      method: 'get',
      url: '/api/node/_paths',
      response: {
        api: {
          getDataById: {
            uri: '/api/node/v1/data/:id',
            method: 'GET',
          },
        },
      },
    },

    {
      method: 'get',
      url: '/api/*',
      response: '',
    },
    {
      method: 'get',
      url: '/cm/*',
      response: '',
    },
    {
      method: 'get',
      url: '/oidc/.well-known/openid-configuration',
      response: openIdConfiguration,
    },
    {
      method: 'get',
      url: '/oidc/*',
      response: '',
    },
  ],
}
