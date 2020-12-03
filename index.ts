import * as Papa from "papaparse";

import * as fs from "fs";
const csvString = fs.readFileSync("data/hades-megasheet.csv","utf8");

const { data: parsedData }  = Papa.parse(csvString);
console.log(parsedData);

const HEADER_ROW = 2;
const HEADER_COL = 2;
const ROWS_TO_SCAN = 104; // starts at and includes HEADER_ROW
const COLS_TO_SCAN = 11; // starts at and includes HEADER_COL

const lastRow = HEADER_ROW + ROWS_TO_SCAN;
const lastCol = HEADER_COL + COLS_TO_SCAN;

const boons = {};
const gods = [];
const colToGod = {};

let i;
for (i = HEADER_ROW; i < lastRow; i++) {
  const row = parsedData[i] || [];

  let j;
  for (j = HEADER_COL; j < row.length; j++) {
    const cellData = row[j];

    // TODO: Handle header column
    if (j === HEADER_COL) {
      continue;
    }

    // Handle header row
    if (i === HEADER_ROW && !!cellData) {
      gods.push(cellData);
      colToGod[j] = cellData;
      continue;
    }

    // Store new boon names
    if ((i - HEADER_ROW - 1) % 6 === 0 && !!cellData) {
      boons[cellData] = {
        id: cellData,
        name: cellData,
        god: colToGod[j],
      };
      continue;
    }
  }
}

console.log("Gods", gods);
console.log("Boons", boons);
