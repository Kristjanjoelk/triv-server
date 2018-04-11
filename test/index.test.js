"use strict";
var assert = require('assert'),
    io = require('socket.io-client'),
    socketURL = 'http://0.0.0.0:3001';

var userObject = {
  name: 'Joel',
  password: 'asdf'
}

var userObject2 = {
  name: 'Joel2',
  password: 'asdf2'
}

describe('Login', function () {
  var isConnected = false;
  var client1 = null;
  var client2 = null;
  var membersObject = null;
  client1 = io.connect(socketURL);
  client1.on('connect', function () {
    isConnected = true;
  });

  client1.on('message', function (msg, data) {
    if (msg === 'membersupdate') {
      membersObject = data;
    }
  });


  before(function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000)
    });
  });
  it('should be able to connect', function () {
    assert.equal(isConnected, true);
  });

  it('should be able to login', function () {
    client1.emit('login', userObject, function (err, res) {
      assert.equal(res.name, userObject.name);
    })
  });

  describe('New User', function () {
    before(function () {
      client2 = io.connect(socketURL);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000)
      });
    });

    /* 
      * -------------- LOGIN EVENT -----------------
    */
    it('client 2 should be able to login', function () {
      client2.emit('login', userObject2, function (err, res) {
        assert.equal(res.name, userObject2.name);
      })
    });

    /* 
     * -------------- MEMBER UPDATE EVENT -----------------
    */
    it('client 1 should have recieved an event that client 2 connected', function () {
      assert.notEqual(membersObject, null);
    });

    it('client 1 should now have two members', function () {
      setTimeout(function() {
        assert.equal(membersObject.length, 2);
      }, 2000);
    });

    /* 
     * -------------- DISCONNECT EVENT -----------------
     */
    it('client 1 should have recieved an event that client 2 disconnected', function () {
      setTimeout(function() {
        client2.disconnect();
      }, 5000);
      // console.log(membersObject);
      setTimeout(function() {
        assert.equal(membersObject.length, 1);
      }, 5000);
    });
  });
});


