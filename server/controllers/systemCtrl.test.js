// Test data
//
const applicationPaths = {
  system: {
    monitor: {
      uri: '/_monitor',
    },
    robots: {
      uri: '/robots.txt',
    },
  },
}

jest.mock('kth-node-redis')

jest.mock('kth-node-express-routing', () => ({
  getPaths: jest.fn(() => applicationPaths),
}))

jest.mock('@kth/kth-node-web-common/lib/language', () => ({
  getLanguage: jest.fn(() => 'sv'),
}))

jest.mock('@kth/log', () => ({
  init: jest.fn(() => {}),
  info: jest.fn(() => {}),
  debug: jest.fn(() => {}),
  error: jest.fn(() => {}),
}))

jest.mock('../../server/configuration', () => ({
  server: {
    api_keys: '1234',
    apiKey: {},
    nodeApi: {},
    db: {},
    logging: {
      log: {
        level: 'debug',
      },
    },
    ldap: {},
    proxyPrefixPath: {
      uri: '/node',
    },
    session: { redisOptions: { host: 'localhost', port: 6379 } },
  },
}))

/*
 * utility functions
 */
function buildReq(overrides) {
  const req = { headers: { accept: 'application/json' }, body: {}, params: {}, ...overrides }
  return req
}

function buildRes(overrides = {}) {
  const res = {
    json: jest.fn(() => res).mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    type: jest.fn(() => res).mockName('type'),
    send: jest.fn(() => res).mockName('send'),
    render: jest.fn(() => res).mockName('render'),
    end: jest.fn(() => res).mockName('end'),
    ...overrides,
  }
  return res
}

describe(`System controller`, () => {
  beforeEach(() => {})
  afterEach(() => {})

  test('monitor returns successfully', async () => {
    const req = buildReq({})
    const res = buildRes()

    const { monitor } = require('./systemCtrl')

    await monitor(req, res)
    expect(res.status).toHaveBeenNthCalledWith(1, 200)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  test('about returns successfully', async () => {
    const req = buildReq({ headers: {} })
    const res = buildRes()

    const { about } = require('./systemCtrl')

    await about(req, res)
    expect(res.render).toHaveBeenCalledTimes(1)
  })
  test('about JSON returns successfully', async () => {
    const req = buildReq({})
    const res = buildRes()

    const { about } = require('./systemCtrl')

    await about(req, res)
    expect(res.json).toHaveBeenCalledTimes(1)
  })
  test('status  returns successfully', async () => {
    const req = buildReq({})
    const res = buildRes()

    // eslint-disable-next-line no-shadow
    const { status } = require('./systemCtrl')

    await status(req, res)
    expect(res.json).toHaveBeenCalledTimes(1)
  })

  test('robotsTxt returns successfully', async () => {
    const req = buildReq({})
    const res = buildRes()

    const { robotsTxt } = require('./systemCtrl')

    await robotsTxt(req, res)

    expect(res.render).toHaveBeenCalledTimes(1)
    expect(res.type).toHaveBeenNthCalledWith(1, 'text')
  })

  test('paths returns successfully', async () => {
    const req = buildReq({})
    const res = buildRes()

    const { paths } = require('./systemCtrl')

    await paths(req, res)

    expect(res.json).toHaveBeenNthCalledWith(1, applicationPaths)
  })
})
