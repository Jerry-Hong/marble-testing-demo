import { Observable } from 'rxjs';
import API from './api.js';

export const show = () => ({
  type: 'SHOW',
});

export const close = data => ({
  type: 'CLOSE',
  payload: data,
});

export const delayEpic = action$ =>
  action$
    .ofType('SHOW')
    .delay(3000)
    .map(x => close());

export const requestEpic = action$ =>
  action$
    .ofType('SHOW')
    .switchMap(() => API('http://jsonplaceholder.typicode.com/posts'))
    .map(close);

export const debounceEpic = action$ =>
  action$
    .ofType('SHOW')
    .debounceTime(300)
    .map(res => close());

export const throttleEpic = action$ =>
  action$
    .ofType('SHOW')
    .throttleTime(300)
    .map(res => close());

export const checkEmail = action$ =>
  action$
    .ofType('SHOW')
    .debounceTime(300)
    .switchMap(() => API('http://jsonplaceholder.typicode.com/posts'))
    .map(close);

export const getPost = action$ =>
  action$
    .ofType('SHOW')
    .throttleTime(300)
    .exhaustMap(() => API('http://jsonplaceholder.typicode.com/posts'))
    .map(close);
