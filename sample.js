import API from './api.js';

export function simpleRequest(Obs) {
  return Obs.switchMap(url => API(url)).map(res => res.response);
}
