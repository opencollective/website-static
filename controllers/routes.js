const fs = require('fs');
const express = require('express');
const path = require('path');
const serverStatus = require('express-server-status');
const favicon = require('serve-favicon');
const request = require('request');
const config = require('config');

const controllers = {}

controllers.api = require('./api');
controllers.apply = require('./apply');
controllers.collectives = require('./collectives');

module.exports = (app) => {
  /**
   * Server status
   */
  app.use('/status', serverStatus(app));

  /**
   * Favicon
   */
  app.use(favicon(__dirname + '/../public/images/favicon.ico.png'));

  /**
   * Static folder
   */
  app.use('/public', express.static(path.join(__dirname, '../public')));
  // Serving /static from the app server #hack
  app.use('/static', (req, res, next) => {
    req.pipe(request(config.host.app + '/static' + req.url)).pipe(res);
  });

  /**
   * /robots.txt 
   */
  app.get('/robots.txt', (req, res) => res.sendFile(path.resolve(__dirname + '/../public/robots.txt')));

  /**
   * Pipe the requests before the middlewares, the piping will only work with raw
   * data
   * More infos: https://github.com/request/request/issues/1664#issuecomment-117721025
   */
  app.all('/api/*', controllers.api);
  
  app.post('/apply', controllers.apply);
  
  app.get('/:slug/widget', controllers.collectives.widget);
  
  app.locals.SHOW_GA = process.env.NODE_ENV === 'production';
  
  app.get('/', (req, res) => {
    
    const meta = {
      title: "OpenCollective - Collect & disburse money transparently",
      description: "Fund your collective and disburse the money transparently",
      twitter: "OpenCollect",
      url: "https://opencollective.com",
      image: '/public/images/app-oreview.png'
    }
        
    res.render('homepage', { meta } );
  });
  
  /**
   * Collectives' public page
   */
  app.get('/:slug([A-Za-z0-9-]+)', controllers.collectives.publicPage);
  
  app.use(function (err, req, res, next) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode);

    if(app.set('env') == 'development')
      res.send(err.message);
    else
      res.sendStatus(err.statusCode);
  }); 
}