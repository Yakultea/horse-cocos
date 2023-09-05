const fs = require('fs');
const path = require('path');

function getLanguageFiles(rootDir) {
  const languageFiles = [];

  function scanDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (stat.isFile() && path.extname(file) === '.csv' && file.includes('Languages')) {
        languageFiles.push(filePath);
      }
    });
  }

  scanDirectory(rootDir);
  return languageFiles;
}

function csvToTs(csvPath, tsPath) {
  try {
    // 讀取CSV檔案內容
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    let lines = csvContent.trim().split('\n');
    // 去除 /r
    lines = lines.map((language) => language.replace('\r', ''));
    const headers = lines.shift().split(',');
    // 獲取語言類型
    let languages = headers.slice(1);
    // 去除 /r
    languages = languages.map((language) => language.replace('\r', ''));

    // 建立TS程式碼
    let tsCode = '';
    // tsCode += 'import { sys } from "cc";';
    for (const language of languages) {
      const languageKey = language.replace('-', '_'); // 將 `-` 取代為 `_`
      tsCode += `
export const ${languageKey.toUpperCase()} = {
  language: '${language}',
  data: {\n`;

      for (const line of lines) {
        const values = parseCSVLine(line);
        let key = values[0];
        let value = values[headers.indexOf(language)]; // 使用 trim() 方法去除分行符號

        // 若 key 為空白，轉換為空字串
        if (!key.trim()) {
          key = '""';
        }

        // 若內容格為空白，轉換為空字串
        if (!value.trim()) {
          value = '';
        }

        // 移除前墜"
        if (value && value.startsWith('"')) {
          value = value.slice(1); // 移除雙引號
        }
        // 移除後墜"
        if (value && value.endsWith('"')) {
          value = value.slice(0, -1); // 移除雙引號
        }

        tsCode += `    ${key}: '${value}',\n`;
      }

      tsCode += `  }
}\n\n`;
    }

    // 將TS程式碼寫入檔案
    fs.writeFileSync(tsPath, tsCode);
    console.log('成功: CSV to TS conversion completed successfully.', tsPath);
  } catch (error) {
    console.error('失敗: Error converting CSV to TS:', error);
  }
}

/** 解析value 避免, 被當成分割符號 */
function parseCSVLine(line) {
  const values = [];
  let insideQuotes = false;
  let currentValue = '';

  for (const char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue);
  return values;
}

const rootDirectory = path.join(process.cwd(), '..', 'proj'); // 取得當前目錄的前一層 
// const rootDirectory = process.cwd(); // 獲取當前目錄
const languageFiles = getLanguageFiles(rootDirectory);

languageFiles.forEach(csvFilePath => {
  const tsFilePath = path.join(path.dirname(csvFilePath), `${path.basename(csvFilePath.split(' - ')[0], '.csv')}.ts`);
  csvToTs(csvFilePath, tsFilePath);
});