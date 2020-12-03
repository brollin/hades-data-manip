import * as Papa from "papaparse";
import * as fs from "fs";

function processCsvData() {
  const csvString = fs.readFileSync("data/hades-megasheet.csv", "utf8");

  const { data: parsedData } = Papa.parse(csvString);

  const HEADER_ROW = 2;
  const HEADER_COL = 2;
  const ROWS_TO_SCAN = 104; // starts at and includes HEADER_ROW
  const VALID_SLOT_NAMES = ["Attack", "Special", "Cast", "Dash", "Call"];

  const lastRow = HEADER_ROW + ROWS_TO_SCAN;

  const cleanText = (text: string) => {
    return text.replace(/\n/g, " ");
  }

  const boons = {};
  const gods = [];
  const colToGod = {};
  const colToBoon = {};

  let i;
  for (i = HEADER_ROW; i < lastRow; i++) {
    const row = parsedData[i] || [];

    let j;
    let rowBoonSlot = "";
    for (j = HEADER_COL; j < row.length; j++) {
      const cellData = cleanText(row[j]);

      // Handle header column
      if (j === HEADER_COL) {
        // On every 6th row,
        if ((i - HEADER_ROW - 1) % 6 === 0 &&
          // check the value in the header column for a valid boon slot value
          VALID_SLOT_NAMES.includes(cellData)) {
          rowBoonSlot = cellData;
        } else {
          rowBoonSlot = "";
        }

        continue;
      }

      // Skip any cell with no cell data
      if (cellData === "") continue;

      // Handle header row
      if (i === HEADER_ROW) {
        gods.push(cellData);
        colToGod[j] = cellData;
        continue;
      }

      // Create new boons
      if ((i - HEADER_ROW - 1) % 6 === 0) {
        boons[cellData] = {
          id: cellData,
          name: cellData,
          god: colToGod[j],
          description: "",
          slot: rowBoonSlot,
          rarityData: {},
          prereqs: [],
        };
        colToBoon[j] = cellData;
        continue;
      }

      // Store boon descriptions
      if ((i - HEADER_ROW - 2) % 6 === 0) {
        boons[colToBoon[j]].description = cellData;
        continue;
      }

      // Otherwise, this is rarity-specific data for the boon
      if ((i - HEADER_ROW - 3) % 6 === 0) {
        boons[colToBoon[j]].rarityData.common = cellData;
      } else if ((i - HEADER_ROW - 4) % 6 === 0) {
        boons[colToBoon[j]].rarityData.rare = cellData;
      } else if ((i - HEADER_ROW - 5) % 6 === 0) {
        boons[colToBoon[j]].rarityData.epic = cellData;
      } else if ((i - HEADER_ROW - 6) % 6 === 0) {
        boons[colToBoon[j]].rarityData.heroic = cellData;
      }
    }
  }

  return boons;
}

function writeBoonData(boons) {
  fs.writeFileSync("output/boons.json", JSON.stringify(boons));
}

function main() {
  console.log("Processing boons from CSV");
  const boons = processCsvData();

  console.log("Writing boon data");
  writeBoonData(boons);
}

main();
