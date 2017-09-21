import { Observable, TestScheduler } from 'rxjs';
import { simpleRequest } from './sample.js';
import API from './api.js';

jest.mock('./api.js');

let testScheduler = new TestScheduler((actual, expected) =>
  expect(actual).toEqual(expected)
);

beforeEach(() => {
  testScheduler = new TestScheduler((actual, expected) =>
    expect(actual).toEqual(expected)
  );
});

afterEach(() => {
  testScheduler.flush();
});

describe('basic sample', () => {
  it('of', () => {
    const actual = Observable.of('Jerry', testScheduler);
    testScheduler.expectObservable(actual).toBe('(a|)', { a: 'Jerry' });
  });

  it('interval', () => {
    const actual = Observable.interval(10, testScheduler)
      .take(3)
      .map(x => x + 1)
      .filter(x => x % 2 === 0);
    /**
     * -01234
     * -01(2|)
     * -12(3|)
     * --2|
    */
    testScheduler.expectObservable(actual).toBe('--a|', { a: 2 });
  });

  it('simpleRequest', () => {
    const res = { name: 'Jerry' };
    const originalObs = testScheduler.createColdObservable('---uu|', {
      u: 'http://google.com',
    });
    const ajaxObs = testScheduler.createColdObservable('---r|', {
      r: { response: res },
    });
    API.mockImplementation(() => ajaxObs);

    const actual = simpleRequest(originalObs);

    /**
     * ---uu|
     * map(() => API())
     * ---o----o|
     *    \    \
     *    \    ---r|
     *    ---r|
     * switch()
     * 
     * -------r|
     */

    testScheduler.expectObservable(actual).toBe('-------r|', { r: res });
  });
});
