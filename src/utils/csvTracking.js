// src/utils/csvTracking.js

/**
 * ดึงข้อมูลออกมาเป็น CSV File 
 * @param {Array} data ข้อมูลที่ต้องการ Export
 * @param {Boolean} isRecords true ถ้าเป็นบันทึกการส่ง (มีเลข Tracking), false ถ้าเป็นแค่รายชื่อ
 */
// One correctly-quoted CSV field.
//
// Fields used to be interpolated straight into `"${value}"`, so a name or an
// address containing a double quote — or a newline, which addresses often carry
// — closed the field early and shifted every remaining column of that row. The
// leading apostrophe on values starting with = + - @ stops Excel and Sheets from
// running them as formulas; this data arrives from operator-uploaded CSV files,
// so it is not trusted input.
const csvField = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const csvRow = (values) => values.map(csvField).join(",");

const thaiDate = (ts) => (ts?.toDate ? ts.toDate().toLocaleDateString("th-TH") : "");

export const exportCSV = async (data, isRecords, showAlert) => {
  if (!data || !data.length) {
    if (showAlert) await showAlert("ไม่มีข้อมูลให้ Export", "แจ้งเตือน");
    return;
  }
  const bom = "\uFEFF";
  let csvContent = "";
  
  if (isRecords) {
    csvContent = [
      csvRow(["ชื่อ-นามสกุล", "เบอร์โทร", "เลข Tracking", "รหัสไปรษณีย์", "เมือง", "วันที่บันทึก", "โบนัสพิเศษ"]),
      ...data.map(r => csvRow([r.fullName, r.phone, r.trackingNumber, r.postalCode, r.city, thaiDate(r.createdAt), r.bonusNote])),
    ].join("\n");
  } else {
    csvContent = [
      csvRow(["ชื่อ-นามสกุล", "เบอร์โทร", "ที่อยู่ / รหัสไปรษณีย์", "โบนัสพิเศษ"]),
      ...data.map(r => csvRow([r.fullName, r.phone, `${r.address || ""} ${r.postalCode || ""}`.trim(), r.bonusNote])),
    ].join("\n");
  }

  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = isRecords ? "tracking_records.csv" : "recipients_list.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
};
