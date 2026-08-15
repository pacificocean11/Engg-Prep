const xlsx = require('xlsx');

const workbook = xlsx.readFile('ENGGtv website Status (30 Jun 2025).xlsx');
const sheetName = 'Mechanical'; // or check if it exists

if (!workbook.Sheets[sheetName]) {
    console.log(`Sheet "${sheetName}" not found. Available sheets:`, workbook.SheetNames);
} else {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // We want the first 3 columns
    const outline = data.map(row => [row[0], row[1], row[2]]);
    console.log(JSON.stringify(outline.slice(0, 50), null, 2)); // Print first 50 rows
}
