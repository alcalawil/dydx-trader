const fs = require('fs-extra');
const childProcess = require('child_process');

try {
  // Remove current build
  fs.removeSync('./dist/');
  // Transpile the typescript files
  childProcess.exec('tsc --build tsconfig.json');
} catch (err) {
  console.log(err);
}

// TODO: (OJO) El comando "tsc" se ejecuta desde la libreria global y no desde la
// instalada en el proyecto
