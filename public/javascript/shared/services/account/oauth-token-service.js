angular.module('gfycat.shared').service('oauthTokenService', ['$window',
  function($window) {

    function getCookieValue(key) {
      var value = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
      return value ? value.pop() : '';
    }

    function setCookie(key, value) {
      var cookieValue = document.cookie = key + '=' + value;
      return cookieValue !== undefined ? true : false;
    }

    function removeCookie(key) {
      document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    }

    function setItemWrapper(key, value) {
      try {
        $window.localStorage.setItem(key, value);
        return true;
      } catch(exception) {
        return setCookie(key, value);
      }
    }

    function getItemWrapper(key) {
      try {
        var value = $window.localStorage.getItem(key);
        if (value === null) throw 'none';
        return value;
      } catch(exception) {
        return getCookieValue(key);
      }
    }

    function setItemSessionWrapper(key, value) {
      try {
        $window.sessionStorage.setItem(key, value);
        return true;
      } catch(exception) {
        return setCookie(key, value);
      }
    }

    function getItemSessionWrapper(key) {
      try {
        var value = $window.sessionStorage.getItem(key);
        if (value === null) throw 'none';
        return value;
      } catch(exception) {
        return getCookieValue(key);
      }
    }

    function removeItemWrapper(key) {
      $window.localStorage.removeItem(key);
      removeCookie(key);
    }

    function removeItemSessionWrapper(key) {
      $window.sessionStorage.removeItem(key);
      removeCookie(key);
    }

    function isUserLoggedIn(){
      try {
        if (getAccessToken()) {
          return true;
        }
        return false;
      }catch (exception){
        return false;
      }
    }

    function getAccessToken(){
      if(getRememberMe()){
        return getItemWrapper("access_token");
      }else{
        return getItemSessionWrapper("access_token");
      }
    }

    function setAccessToken(access_token){
      if(getRememberMe()){
        setItemWrapper("access_token", access_token);
      }else{
        setItemSessionWrapper("access_token", access_token);
      }
    }

    function removeAccessToken(){
      removeItemWrapper("access_token");
      removeItemSessionWrapper("access_token");
    }

    function getClientToken(){
      if(getItemWrapper("client_token")){
        return getItemWrapper("client_token");
      }else{
        return false;
      }
    }

    function setClientToken(client_token){
      setItemWrapper("client_token", client_token);
    }

    function getUsername(){
      if(getRememberMe()){
        return getItemWrapper("username");
      }else{
        return getItemSessionWrapper("username");
      }
    }

    function setUsername(username){
      if(getRememberMe()){
        setItemWrapper("username", username);
      }else{
        setItemSessionWrapper("username", username);
      }
    }

    function removeUsername(){
      removeItemWrapper("username");
      removeItemSessionWrapper("username");
    }

    function getRefreshToken(){
      if(getRememberMe()){
        return getItemWrapper("refresh_token");
      }else{
        return getItemSessionWrapper("refresh_token");
      }
    }

    function setRefreshToken(refresh_token){
      if(getRememberMe()){
        setItemWrapper("refresh_token", refresh_token);
      }else{
        setItemSessionWrapper("refresh_token", refresh_token);
      }
    }
    function removeRefreshToken(){
      removeItemWrapper("refresh_token");
      removeItemSessionWrapper("refresh_token");
    }

    function getRememberMe(){
      var rememberMe = getItemWrapper("rememberMe");
      if (rememberMe) {
        return true;
      }
      return false;
    }

    function setRememberMe(rememberMe){
      if(rememberMe === true){
        setItemWrapper("rememberMe",true);
      }else{
        removeItemWrapper("rememberMe");
      }
    }
    function removeRememberMe(){
      return removeItemWrapper("rememberMe");
    }
    function removeTokensOnly(){
      removeAccessToken();
      removeRefreshToken();
    }
    function removeCredentials(){
      removeAccessToken();
      removeRefreshToken();
      removeUsername();
      removeRememberMe();
    }

    return {
      getClientToken: getClientToken,
      setClientToken: setClientToken,
      getAccessToken: getAccessToken,
      setAccessToken: setAccessToken,
      removeAccessToken: removeAccessToken,
      getRefreshToken: getRefreshToken,
      setRefreshToken: setRefreshToken,
      removeRefreshToken: removeRefreshToken,
      getUsername: getUsername,
      setUsername: setUsername,
      removeUsername: removeUsername,
      getRememberMe: getRememberMe,
      setRememberMe: setRememberMe,
      removeRememberMe: removeRememberMe,
      isUserLoggedIn: isUserLoggedIn,
      removeCredentials: removeCredentials,
      removeTokensOnly: removeTokensOnly
    };
  }
]);
