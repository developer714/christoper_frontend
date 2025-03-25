// extract-frontend-code.js
const fs = require('fs');
const path = require('path');

// Configuration
const outputFile = 'frontend-code-export.json';
const ignoredItems = [
  'node_modules',
  'package-lock.json',
  '.git',
  'dist',
  'build',
  '.DS_Store'
];

// Result object to store all file contents
const result = {};

// Recursively read directory
function readDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      
      // Skip ignored items
      if (ignoredItems.includes(item)) {
        continue;
      }
      
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        readDirectory(itemPath);
      } else {
        // Read file content
        try {
          const content = fs.readFileSync(itemPath, 'utf8');
          result[itemPath] = content;
        } catch (error) {
          console.error(`Error reading file ${itemPath}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Start the process from the current directory
console.log('Starting to extract frontend code...');
readDirectory('.');

// Write the result to the output file
try {
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Frontend code successfully exported to ${outputFile}`);
} catch (error) {
  console.error('Error writing output file:', error.message);
}