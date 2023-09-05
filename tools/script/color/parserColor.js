const fs = require('fs');
const path = require('path');

// 從 input.json 讀取輸入的 JSON 資料
const inputPath = path.join(__dirname, 'input.json');
const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// 解析 JSON 資料，並移除 key 的雙引號
function parseJSON(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const newObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = key.replace(/"/g, ''); // 移除雙引號
            newObj[newKey] = parseJSON(obj[key]);
        }
    }
    return newObj;
}

// 移除 $value 這個 key，將其值賦予父層
function removeValueKey(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    const newObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (key === '$value') {
                const parentValue = obj[key];
                return parentValue;
            } else {
                newObj[key] = removeValueKey(obj[key]);
            }
        }
    }
    return newObj;
}

// 將 rgba 值進行轉換
function transformRGBA(value) {
    const rgbaPattern = /rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)/;
    const match = value.match(rgbaPattern);
    if (match) {
        const red = match[1];
        const green = match[2];
        const blue = match[3];
        const alpha = parseFloat(match[4]);
        return `new Color(${red}, ${green}, ${blue}, 255 * ${alpha})`;
    } else {
        return value;
    }
}

// 將顏色值進行轉換
function transformValue(value) {
    if (value.startsWith('#')) {
        return `new Color('${value}')`;
    } else if (value.startsWith('rgba')) {
        return transformRGBA(value);
    } else {
        return value;
    }
}

// 遞迴處理 JSON 資料
function transformData(data) {
    if (typeof data === 'object') {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = transformData(data[key]);
            }
        }
    } else if (typeof data === 'string') {
        data = transformValue(data);
    }
    return data;
}

const parsedData = parseJSON(inputData);
const dataWithValueRemoved = removeValueKey(parsedData);
const transformedData = transformData(dataWithValueRemoved);

// 建立 TypeScript 內容，並手動去除 key 的雙引號
function formatOutput(data) {
    const formattedData = JSON.stringify(data, null, 4);
    return formattedData.replace(/"([^"]+)":/g, '$1:');
}

const tsContent = `// @ts-nocheck

this.data = ${formatOutput(transformedData).replace(/"new Color\(([^)]+)\)"/g, 'new Color($1)')};\n`;

// 將內容寫入輸出的 .ts 檔案
const outputPath = path.join(__dirname, 'output.ts');
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log('已生成輸出檔案 "output.ts"。');