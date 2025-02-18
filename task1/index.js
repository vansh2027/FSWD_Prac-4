import { createInterface } from 'readline';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const rl = createInterface({
  input: process.stdin,  
  output: process.stdout 
});

rl.question('Please enter the path: ', async (dirname) => {
    let files = await fsp.readdir(dirname);

    for (const content of files) {
        let contentArr = content.split(".");
        if(contentArr.length > 1) {
            let ext = contentArr[1];
            if (!fs.existsSync(path.join(dirname, ext))) {
                fs.mkdirSync(path.join(dirname,ext));
                fs.appendFileSync("summary.txt", `${ext} folder created\n`);
            }
            fsp.rename(path.join(dirname,content), path.join(dirname, ext, content));
            fs.appendFileSync("summary.txt", `${content} moved to ${ext} folder\n`);
        }
    }
    rl.close();
});