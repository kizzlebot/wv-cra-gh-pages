import initServer from '../server';




const auth = jest.fn(() => ({
  signInAnonymously: async () => ({}),
  setPersistence: async () => ({}),
  signInWithCustomToken: async () => ({ })
}))

const ref = () => ({
  child: () => ref(),
  on: () => {},
  set: (arg) => arg,
  onDisconnect: () => {}
})

auth.Auth = {
  Persistence: { SESSION: 1 }
}

const firebase = {
  auth,
  database: () => ({ ref: ref })
}

describe('server', () => {

  it('hsould initialize firebase', async () => {
    const server = await initServer(firebase, { rtdbNamespace: 'orgid', userId: 'userId', nsId: 'nsId' });
  }, 10000);

  it('hsould initialize firebase', async () => {
    const server = await initServer(firebase, { 
      rtdbNamespace: 'orgid', 
      userId: 'userId', 
      nsId: 'nsId',
      token: 'testtoken'
    });
  }, 10000);
})