const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('http://localhost:5001/api')) {
    const newContent = content.replace(/http:\/\/localhost:5001\/api/g, '${import.meta.env.VITE_API_URL}');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated ' + filePath);
  } else if (content.includes("'http://localhost:5001/api")) {
    const newContent = content.replace(/'http:\/\/localhost:5001\/api/g, '`${import.meta.env.VITE_API_URL}');
    // we have to handle the ending quote if it was a string
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // regex to replace 'http://localhost:5001/api/...' or `http://localhost:5001/api/...`
      // basically replacing "http://localhost:5001/api" with `${import.meta.env.VITE_API_URL}`
      
      // if it's inside single quotes, e.g. 'http://localhost:5001/api/login', we need to change it to template literal
      // It's easier to just do: content.replace(/['"`]http:\/\/localhost:5001\/api([^'"`]*)['"`]/g, "`\\${import.meta.env.VITE_API_URL}$1`")
      
      const newContent = content.replace(/['"`]http:\/\/localhost:5001\/api([^'"`]*)['"`]/g, "`\\${import.meta.env.VITE_API_URL}$1`");
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(srcDir);
