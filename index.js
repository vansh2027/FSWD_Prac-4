const fs = require('fs');
const path = require('path');

const fileCategories = {
  Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  Documents: ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.xls', '.xlsx'],
  Videos: ['.mp4', '.mkv', '.avi', '.mov', '.flv'],
  Music: ['.mp3', '.wav', '.aac'],
};

function organizeFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    console.error('Error: Directory does not exist.');
    return;
  }

  const files = fs.readdirSync(directoryPath);
  if (files.length === 0) {
    console.log('No files to organize.');
    return;
  }

  const summaryLog = [];
  
  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    if (fs.lstatSync(filePath).isFile()) {
      const fileExtension = path.extname(file).toLowerCase();
      let folderName = 'Others';

      for (const [category, extensions] of Object.entries(fileCategories)) {
        if (extensions.includes(fileExtension)) {
          folderName = category;
          break;
        }
      }

      const folderPath = path.join(directoryPath, folderName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      const newFilePath = path.join(folderPath, file);
      fs.renameSync(filePath, newFilePath);

      summaryLog.push(`${file} -> ${folderName}`);
    }
  });

  const summaryPath = path.join(directoryPath, 'summary.txt');
  fs.writeFileSync(summaryPath, summaryLog.join('\n'));
  console.log('Files organized successfully. Summary saved in summary.txt');
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Please provide a directory path as an argument.');
  process.exit(1);
}

organizeFiles(path.resolve(inputPath));
