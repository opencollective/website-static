const fs = require('fs');
const express = require('express');
const path = require('path');
const serverStatus = require('express-server-status');
const favicon = require('serve-favicon');
const request = require('request');
const config = require('config');

const controllers = require('./controllers');

module.exports = (app) => {
  /**
   * Server status
   */
  app.use('/status', serverStatus(app));

  /**
   * Favicon
   */
  app.use(favicon(__dirname + '/public/images/favicon.ico.png'));

  /**
   * Static folder
   */
  app.use('/public', express.static(path.join(__dirname, '/public')));
  // Serving /static from the app server #hack
  app.use('/static', (req, res, next) => {
    req.pipe(request(config.host.app + '/static' + req.url)).pipe(res);
  });

  /**
   * /robots.txt 
   */
  app.get('/robots.txt', (req, res) => res.sendFile(path.resolve(__dirname + '/public/robots.txt')));

  /**
   * Pipe the requests before the middlewares, the piping will only work with raw
   * data
   * More infos: https://github.com/request/request/issues/1664#issuecomment-117721025
   */
  app.all('/api/*', controllers.api);
  
  app.post('/apply', controllers.apply);
  
  app.get('/:slug/widget', controllers.collectives.widget);
  
  app.locals.SHOW_GA = process.env.NODE_ENV === 'production';

  var meta = {
    title: "OpenCollective - Collect & disburse money transparently",
    description: "Fund your collective and disburse the money transparently",
    twitter: "OpenCollect",
    url: "https://opencollective.com",
    image: '/public/images/app-preview.png'
  }

  app.get('/', (req, res) => {
    res.render('homepage', { meta, mailchimp_list_id: "14d6233180" } );
  });

  app.get('/faq', (req, res) => res.render('faq', { meta } ) );
  app.get('/about', (req, res) => res.render('about', { meta } ) );
  
  app.get('/meetups', (req, res) => res.render('meetups', { meta, mailchimp_list_id: "06c7d54ba2" } ) );  
  app.get('/opensource', (req, res) => res.render('opensource', { meta, mailchimp_list_id: "dcc832cd00" } ) );
    
  app.use((err, req, res, next) => {
    if(err) {
      console.error(err, err.stack);
      err.statusCode = err.statusCode || 500;
      res.status(err.statusCode);

      if(app.set('env') === 'development')
        res.send(err.message);
      else
        res.sendStatus(err.statusCode);
    }
  }); 
}