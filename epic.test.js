import {
  createExpectedEpic,
  mockDelay,
  mockDebounceTime,
  mockThrottleTime,
} from 'redux-observable-test-helper';
import {
  delayEpic,
  show,
  close,
  requestEpic,
  debounceEpic,
  throttleEpic,
  checkEmail,
  getPost,
} from './epic.js';
import API from './api.js';

jest.mock('./api.js');

const request = (timer, value) => testScheduler => {
  API.mockImplementation(() =>
    testScheduler.createColdObservable(timer, value)
  );
};

const expectedEpic = createExpectedEpic((actual, expected) => {
  expect(actual).toEqual(expected);
});

test('test delay', () => {
  expectedEpic(
    delayEpic,
    {
      expect: ['--a', { a: close() }],
      action: ['a', { a: show() }],
    },
    mockDelay('--|')
  );
});

test('test request', () => {
  expectedEpic(
    requestEpic,
    {
      action: ['-a', { a: show() }],
      expect: ['---r', { r: close({ data: 123 }) }],
    },
    request('--r|', { r: { data: 123 } })
  );
});

test('test throttleTime', () => {
  expectedEpic(
    throttleEpic,
    {
      action: ['aaaaa-a', { a: show() }],
      expect: ['a--a--a', { a: close() }],
    },
    mockThrottleTime('--|')
  );
});

test('test debounceTime', () => {
  expectedEpic(
    debounceEpic,
    {
      action: ['aa--a-a--', { a: show() }],
      expect: ['---a----a', { a: close() }],
    },
    mockDebounceTime('--|')
  );
});

test('test checkEmail', () => {
  /**
   * action: aa--a---
   *      debounceTime(--|)
   *         ---a--a---
   *       map(() => API(----r|))
   *         ---o--o---
   *            \  \
   *            \  ----r|
   *            ----r|
   *         switch()
   *         ----------r
   */
  expectedEpic(
    checkEmail,
    {
      action: ['aa--a---', { a: show() }],
      expect: ['----------r', { r: close({ data: 123 }) }],
    },
    mockDebounceTime('--|'),
    request('----r|', { r: { data: 123 } })
  );
});

test('test infinite scroll', () => {
  /**
   * action: aaaaaa-a
   *      ThrottleTime(--|)
   *         a--a---a
   *       map(() => API(----|))
   *         o--o---o
   *         \  \   \
   *         \  \   ----r|
   *         \  ----r|
   *         ----r|
   *         exhaust()
   *         ----r------r
   */
  expectedEpic(
    getPost,
    {
      action: ['aaaaaa-a', { a: show() }],
      expect: ['----r------r', { r: close({ data: 123 }) }],
    },
    mockThrottleTime('--|'),
    request('----r|', { r: { data: 123 } })
  );
});