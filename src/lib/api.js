const io = require('socket.io-client');
const querystring = require('querystring');

const protocol = 'https'
const protoPackage = require(protocol);

function api({ token, isDemo }) {
  const port = 443
  const host = `api${isDemo ? '-demo' : ''}.fxcm.com`
  const requestHeaders = {
    'User-Agent': 'request',
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  let socket
  let globalRequestID = 1

  function getNextRequestID() {
    return globalRequestID++;
  }

  this.request = (method, resource, params) => new Promise((resolve) => {
    const requestID = getNextRequestID();

    if (typeof (method) === 'undefined') {
      method = "GET";
    }

    // GET HTTP(S) requests have parameters encoded in URL
    if (method === "GET") {
      resource += '/?' + querystring.stringify(params);
    }

    const processResponse = (statusCode, requestID, data) => {
      if (statusCode === 200) {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData)
        } catch (e) {
          console.log('request #', requestID, ' JSON parse error:', e);
          resolve()
        }
      } else {
        console.log('request #', requestID, ' execution error:', statusCode, ' : ', data);
        resolve()
      }
    }

    const reqParams = {
      host: host,
      port: port,
      path: resource,
      method: method,
      headers: requestHeaders
    }

    const req = protoPackage.request(reqParams, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk); // re-assemble fragmented response data
      response.on('end', () => {
        processResponse(response.statusCode, requestID, data);
      });
    })

    req.on('error', (err) => {
      processResponse(0, requestID, err)
    })

    req.end()
  })

  this.authenticate = () => new Promise((resolve) => {
    socket = io(`${protocol}://${host}:${port}`, {
      query: querystring.stringify({
        access_token: token
      })
    });

    socket.on('connect', () => {
      // console.log('Socket.IO session has been opened: ', socket.id);
      requestHeaders.Authorization = 'Bearer ' + socket.id + token;
      resolve(requestHeaders)
    });

    socket.on('connect_error', (error) => {
      console.log('Socket.IO session connect error: ', error);
      resolve()
    });

    socket.on('error', (error) => {
      console.log('Socket.IO session error: ', error);
      resolve()
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected, terminating client.');
      console.log('✋ Reconnecting after disconnect');
      socket.connect()
      // process.exit(-1);
      resolve()
    });
  })

  this.logout = () => socket.disconnect()

  return this
}

module.exports = api
