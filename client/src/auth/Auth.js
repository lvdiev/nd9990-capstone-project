import auth0 from 'auth0-js';
import { authConfig } from '../config';

let accessToken;
let idToken;
let expiresAt;
let _history;

const auth0Client = new auth0.WebAuth({
  domain: authConfig.domain,
  clientID: authConfig.clientId,
  redirectUri: authConfig.callbackUrl,
  responseType: 'token id_token',
  scope: 'openid'
});

const login = () => auth0Client.authorize();
const getAccessToken = () => accessToken;
const getIdToken = () => idToken;
const isAuthenticated = () => new Date().getTime() < expiresAt;

const handleAuthentication = (history) => {
  _history = history;

  auth0Client.parseHash((err, authResult) => {
    if (authResult?.accessToken && authResult.idToken) {
      setSession(authResult);
      console.log(authResult);
      return;
    }

    if (err) {
      _history.replace('/');
      console.log(err);
      alert(`Error: ${err.error}. Check the console for further details.`);
    }
  });
};

const setSession = (authResult) => {
  // Set isLoggedIn flag in localStorage
  localStorage.setItem('isLoggedIn', 'true');

  // Set the time that the access token will expire at
  expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
  ({ accessToken, idToken } = authResult);

  // navigate to the home route
  _history.replace('/');
};

const renewSession = () => {
  auth0Client.checkSession({}, (err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
      return;
    }

    if (err) {
      logout();
      console.log(err);
      alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
    }
  });
};

const logout = () => {
  // Remove tokens and expiry time
  accessToken = null;
  idToken = null;
  expiresAt = 0;

  // Remove isLoggedIn flag from localStorage
  localStorage.removeItem('isLoggedIn');

  auth0Client.logout({
    return_to: window.location.origin
  });

  // navigate to the home route
  _history.replace('/');
};

export {
  login,
  handleAuthentication,
  getAccessToken,
  getIdToken,
  setSession,
  renewSession,
  logout,
  isAuthenticated
};
