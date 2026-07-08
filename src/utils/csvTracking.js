// src/utils/csvTracking.js

/**
 * ดึงข้อมูลออกมาเป็น CSV File 
 * @param {Array} data ข้อมูลที่ต้องการ Export
 * @param {Boolean} isRecords true ถ้าเป็นบันทึกการส่ง (มีเลข Tracking), false ถ้าเป็นแค่รายชื่อ
 */
export const exportCSV = async (data, isRecords, showAlert) => {
  if (!data || !data.length) {
    if (showAlert) await showAlert("ไม่มีข้อมูลให้ Export", "แจ้งเตือน");
    return;
  }
  const bom = "\uFEFF";
  let csvContent = "";
  
  if (isRecords) {
    csvContent = "ชื่อ-นามสกุล,เบอร์โทร,เลข Tracking,รหัสไปรษณีย์,เมือง,วันที่บันทึก,โบนัสพิเศษ\n" + 
      data.map(r => `"${r.fullName}","${r.phone}","${r.trackingNumber}","${r.postalCode}","${r.city}","${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('th-TH') : ''}","${r.bonusNote||''}"`).join("\n");
  } else {
    csvContent = "ชื่อ-นามสกุล,เบอร์โทร,ที่อยู่ / รหัสไปรษณีย์,โบนัสพิเศษ\n" + 
      data.map(r => `"${r.fullName}","${r.phone}","${r.address} ${r.postalCode}","${r.bonusNote||''}"`).join("\n");
  }

  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = isRecords ? "tracking_records.csv" : "recipients_list.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
};
