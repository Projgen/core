const printRow = (row: unknown[], columnWidths: number[]) => {
  const formattedCells = row.map((cell, index) => {
    const width = columnWidths[index];
    return String(cell).padEnd(width || 0);
  });
  console.log("| " + formattedCells.join(" | ") + " |");
};

const printSeparator = (width: number) => {
  console.log("-".repeat(width));
};

export const printTable = (data: unknown[][], headers: string[]) => {
  const columnWidths = headers.map((header, index) => {
    const maxDataWidth = Math.max(
      ...data.map((row) => String(row[index]).length),
      header.length,
    );
    return maxDataWidth + 2; // Add padding
  });

  const totalWidth =
    columnWidths.reduce((sum, width) => sum + width, 0) +
    headers.length * 3 +
    1;

  printSeparator(totalWidth);
  printRow(headers, columnWidths);
  printSeparator(totalWidth);
  data.forEach((row) => printRow(row, columnWidths));
  printSeparator(totalWidth);
};
