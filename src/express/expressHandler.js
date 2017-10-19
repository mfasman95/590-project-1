const express = require('express');
const path = require('path');

// File for setting up express endpoints
module.exports = Object.freeze({
  initExpress: (app) => {
    // Serve the build folder for the canvas application at the root directory
    app.use('/', express.static(path.join(__dirname, './../../canvas-app/build')));
  },
});
