'use strict';

const miniprofiler = require('miniprofiler');
const http = require('http');
const request = require('request');

const endpoints = {
  'http': 'http://localhost:9080',
  'https': 'https://localhost:9443'
};

const app = miniprofiler.express({
  enable: (req, res) => {
    return !req.url.startsWith('/unprofiled');
  }
});

const server = http.createServer((req, res) => {
  app(req, res, () => {
    require('../index.js')().handler(req, res, () => {
      for(const protocol in endpoints) {
        if (req.url == `/${protocol}/send-get`) {
          request(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

        if (req.url == `/${protocol}/send-post`) {
          request.post(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

        if (req.url == `/unprofiled/${protocol}/send-get`) {
          request(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

        if (req.url == `/${protocol}/broken`) {
          // Use an invalid port to trigger an http error
          request('http://localhost:9', function(error, response, body) {
            res.end('Error');
          });
        }
      }
    });
  });
});

server.endpoints = endpoints;
module.exports = server;
