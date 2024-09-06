const fs = require('fs');

class StorageService {
  constructor(directory) {
    this.directory = directory;

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = `${+new Date()}-${meta.filename}`;
    const path = `${this.directory}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  deleteFile(filename) {
    const path = `${this.directory}/${filename}`;
    fs.unlink(path, (err) => {
      if (err) throw err;
    });
  }
}

module.exports = StorageService;
