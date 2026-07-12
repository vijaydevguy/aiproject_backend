import XLSX from "xlsx";

export const readExcel = (buffer) => {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });
};