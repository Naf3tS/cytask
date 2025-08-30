
const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, 'version.json');

// Read the version file
fs.readFile(versionFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading version file:', err);
    process.exit(1);
  }

  try {
    const versionData = JSON.parse(data);
    const version = versionData.version;

    // Increment the patch version
    const parts = version.split('.').map(Number);
    parts[2]++; 
    versionData.version = parts.join('.');

    // Write the updated version back to the file
    fs.writeFile(versionFilePath, JSON.stringify(versionData, null, 2) + '\n', 'utf8', (err) => {
      if (err) {
        console.error('Error writing version file:', err);
        process.exit(1);
      }
      console.log(`Version incremented to ${versionData.version}`);
      process.exit(0);
    });
  } catch (parseErr) {
    console.error('Error parsing version file:', parseErr);
    process.exit(1);
  }
});
