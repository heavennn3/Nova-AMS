import fs from 'fs';
import * as XLSX from 'xlsx';

const file = fs.readFileSync('KKFIR NRSB - ICT_Asset_Registration (1).xlsx');
const workbook = XLSX.read(file, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

for (let i = 3; i < 10; i++) {
    console.log(`\nRow ${i+1}:`);
    console.log(json[i]);
}
