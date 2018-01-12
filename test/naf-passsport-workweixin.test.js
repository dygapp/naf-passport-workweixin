'use strict';

const mock = require('egg-mock');

describe('test/naf-passsport-workweixin.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/naf-passsport-workweixin-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, nafPasssportWorkweixin')
      .expect(200);
  });
});
