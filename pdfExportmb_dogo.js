document.getElementById("savePdfBtn").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  let y = 25;

  const container = document.querySelector(".container");
  if (!container) return alert("Container not found!");

  // --- helper to add text with alignment, font, and color ---
  function addText(
    text,
    align = "left",
    fontSize = 8,
    fontStyle = "normal",
    color = [0, 0, 0],
    lineGap = 5,
    underline = false
  ) {
    doc.setFont(undefined, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, pageWidth - 20);
    lines.forEach((line) => {
      let x = 10;
      if (align === "center") x = pageWidth / 2;
      else if (align === "right") x = pageWidth - 10;

      doc.text(line, x, y, { align });

      if (underline) {
        const textWidth =
          (doc.getStringUnitWidth(line) * fontSize) / doc.internal.scaleFactor;
        let lineX = align === "center" ? pageWidth / 2 - textWidth / 2 : x;
        if (align === "right") lineX = x - textWidth;
        doc.setDrawColor(...color);
        doc.setLineWidth(0.2);
        doc.line(lineX, y + 1, lineX + textWidth, y + 1);
      }

      y += lineGap * 0.75;
    });
  }

  // Function to check page break
  function checkPageBreak(heightNeeded) {
    if (y + heightNeeded > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  }

  // ===== HEADER SECTION =====
  let headerY = 3;

  // Logos
  if (typeof img1 !== "undefined" && img1) {
    doc.addImage(img1, "PNG", 10, headerY + 2, 22, 15);
  }
  if (typeof img2 !== "undefined" && img2) {
    doc.addImage(img2, "PNG", pageWidth - 35, headerY + 2, 22, 13);
  }

  // Organization info
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 139, 139);
  doc.text("PAPUA NEW GUINEA NATIONAL WEATHER SERVICE", pageWidth / 2, headerY + 5, { align: "center" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("P.O. Box 1240, BOROKO, National Capital District, Papua New Guinea", pageWidth / 2, headerY + 10, { align: "center" });
  doc.text("Telephone: (+675) 325 2788 or (+675) 325 5544   email: png.nws@gmail.com   Website: www.pngmet.gov.pg", pageWidth / 2, headerY + 14, { align: "center" });

  // Header line
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 139, 139);
  doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.setLineWidth(0.35);
  doc.line(10, headerY + 18, pageWidth - 10, headerY + 18);
  doc.setGState(new doc.GState({ opacity: 1 }));
  y += 5;

  // Document headers
  const headerLeft = container.querySelector("h4:first-of-type")?.textContent.trim() || "ZCZC GOPNG";
  const headerRight = container.querySelector("#current-Date")?.textContent.trim() || "";

  doc.setFont("helvetica");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(headerLeft, 10, y);
  doc.text(headerRight, pageWidth - 10, y, { align: "right" });
  y += 5;

  addText("MILNE BAY WEATHER FORECASTS", "center", 10, "bold", [0, 91, 137]);
  addText("FOR MORNING & TODAY", "center", 10, "bold", [0, 91, 137]);
  y += 5;

  // Forecast validity line
  const beforeText = "FORECASTS FOR THE NEXT 24 HOURS VALID AT  ";
  const redTime = " 8:00 AM";
  const afterText = " AS ISSUED BY PAPUA NEW GUINEA NATIONAL WEATHER SERVICE.";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const totalWidth = (doc.getStringUnitWidth(beforeText + redTime + afterText) * 8) / doc.internal.scaleFactor;
  const startX = (pageWidth - totalWidth) / 2;

  doc.setTextColor(0, 0, 0);
  doc.text(beforeText, startX, y);
  const beforeWidth = (doc.getStringUnitWidth(beforeText) * 8) / doc.internal.scaleFactor;
  doc.setTextColor(216, 41, 44);
  doc.text(redTime, startX + beforeWidth, y);
  const redWidth = (doc.getStringUnitWidth(redTime) * 8) / doc.internal.scaleFactor;
  doc.setTextColor(0, 0, 0);
  doc.text(afterText, startX + beforeWidth + redWidth, y);
  y += 3;

  y += 1.5;
  addText(
    "NB: FORECASTS AREA WITHIN 60 NAUTICAL MILES OR 111 KILOMETRES FROM THE COASTLINE.",
    "center", 7, "italic", [0, 0, 0], 2
  );
  y += 6;

  // ===== SYNOPTIC SITUATION heading =====
  let synopticHeadingEl =
    container.querySelector('div[style*="text-decoration: underline"]') ||
    container.querySelector('div:has(span#dateSynops)') ||
    container.querySelector("div:contains('SYNOPTIC SITUATION')");

  if (synopticHeadingEl) {
    const timeText =
      synopticHeadingEl.querySelector("span[style*='#D8292C']")?.textContent.trim() ||
      "04:00 PM";
    const dateSynops =
      container.querySelector("#dateSynops")?.textContent.trim() || "";
    const utcText =
      container.querySelector("#UTCdate")?.textContent.trim() || "";

    const beforeTime = "SYNOPTIC SITUATION AT ";
    const afterTime = ` ${dateSynops ? dateSynops + " " : ""}[ ${utcText}1800 UTC ]`;

    const lineText = beforeTime + timeText + afterTime;
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.setTextColor(16, 91, 137);

    const startX = 10;
    doc.text(beforeTime, startX, y);

    const beforeWidth =
      (doc.getStringUnitWidth(beforeTime) * 8) / doc.internal.scaleFactor;
    doc.setTextColor(216, 41, 44);
    doc.text(timeText, startX + beforeWidth, y);

    const timeWidth =
      (doc.getStringUnitWidth(timeText) * 8) / doc.internal.scaleFactor;
    doc.setTextColor(16, 91, 137);
    doc.text(afterTime, startX + beforeWidth + timeWidth, y);

    const totalWidth =
      (doc.getStringUnitWidth(lineText) * 8) / doc.internal.scaleFactor;
    doc.setDrawColor(16, 91, 137);
    doc.setLineWidth(0.2);
    doc.line(startX, y + 1, startX + totalWidth, y + 1);

    y += 6;
  }

  // ===== Bullet textbox contents =====
  const bulletItems = container.querySelectorAll("#bulletTextbox li");
  bulletItems.forEach((li) => {
    doc.setFont("times", "italic");
    addText("• " + li.textContent.trim(), "left", 8, "italic", [0, 0, 0], 4);
  });

  y += 4;

  // Warnings
  const warningContainer = container.querySelector(".warnings");
  if (warningContainer) {
    const w1 = warningContainer.children[0]?.textContent.trim() || "WARNINGS :";
    const w2 = warningContainer.children[1]?.textContent.trim() || "";

    const startX = 10;
    const lineSpacing = 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(216, 41, 44);
    doc.text(w1, startX, y);
    const warningWidth = (doc.getStringUnitWidth(w1) * 7) / doc.internal.scaleFactor;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 0, 0);
    const availableWidth = pageWidth - startX - warningWidth - 10;
    const bodyLines = doc.splitTextToSize(w2, availableWidth);

    doc.text(bodyLines[0], startX + warningWidth + 1.5, y);

    for (let i = 1; i < bodyLines.length; i++) {
      y += lineSpacing;
      doc.text(bodyLines[i], startX + 1, y);
    }

    y += 5;
  }

  // ===== SINGLE UNIFIED TABLE (CENTERED & BLUE BORDERS) =====
  try {
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const colWidth = contentWidth / 2;
    
    function getTableContent(selector) {
      const element = document.querySelector(`.minor-weather-table ${selector}`);
      if (!element) return '';
      
      const noteLines = element.querySelectorAll('.minor-note-line');
      let content = '';
      
      noteLines.forEach(line => {
        if (line.textContent.trim()) {
          content += line.textContent.trim() + '\n';
        }
      });
      
      return content.trim();
    }

    function getTextHeight(text, width) {
      const lines = doc.splitTextToSize(text, width - 10);
      return (lines.length * 3.5) + 3;
    }

    // Set table border and gridline color to Blue ([0, 91, 137])
    doc.setDrawColor(0, 91, 137);
    doc.setLineWidth(0.3);
    

    const tableStartY = y;

    const rowHeights = [];
    rowHeights.push(5);
    const watersContent = getTableContent('tr:nth-child(2)');
    rowHeights.push(getTextHeight(watersContent, contentWidth));
    
    rowHeights.push(5);
    const alotauContent = getTableContent('tr:nth-child(4) td:first-child');
    const trobriandContent = getTableContent('tr:nth-child(4) td:last-child');
    rowHeights.push(Math.max(
      getTextHeight(alotauContent, colWidth),
      getTextHeight(trobriandContent, colWidth)
    ));
    
    rowHeights.push(5);
    const misimaContent = getTableContent('tr:nth-child(6) td:first-child');
    const woodlarkContent = getTableContent('tr:nth-child(6) td:last-child');
    rowHeights.push(Math.max(
      getTextHeight(misimaContent, colWidth),
      getTextHeight(woodlarkContent, colWidth)
    ));
    
    rowHeights.push(5);
    const sudestContent = getTableContent('tr:nth-child(8) td:first-child');
    const goodenoughContent = getTableContent('tr:nth-child(8) td:last-child');
    rowHeights.push(Math.max(
      getTextHeight(sudestContent, colWidth),
      getTextHeight(goodenoughContent, colWidth)
    ));
    
    rowHeights.push(5);
    const forecastContent = getTableContent('tr:nth-child(10) td');
    rowHeights.push(getTextHeight(forecastContent, contentWidth));

    let rowY = tableStartY;
    doc.setLineWidth(0.1);
    doc.setDrawColor(0, 91, 137); // Ensure gridlines are blue
    
    for (let i = 0; i < rowHeights.length; i++) {
      const rowHeight = rowHeights[i];
      if (i !== 0 && i !== 2 && i !== 4 && i !== 6 && i !== 8) {
        doc.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);
      }
      if (i === 2 || i === 3 || i === 4 || i === 5 || i === 6 || i === 7) {
        doc.line(margin + colWidth, rowY, margin + colWidth, rowY + rowHeight);
      }
      rowY += rowHeight;
    }
    
    doc.setLineWidth(0.3);
    doc.rect(margin, tableStartY, contentWidth, rowY - tableStartY);
    
    doc.setLineWidth(0.1);
    doc.line(margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1], margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1] + rowHeights[2] + rowHeights[3]);
    doc.line(margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1] + rowHeights[2] + rowHeights[3] + rowHeights[4], margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1] + rowHeights[2] + rowHeights[3] + rowHeights[4] + rowHeights[5]);
    doc.line(margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1] + rowHeights[2] + rowHeights[3] + rowHeights[4] + rowHeights[5] + rowHeights[6], margin + colWidth, tableStartY + rowHeights[0] + rowHeights[1] + rowHeights[2] + rowHeights[3] + rowHeights[4] + rowHeights[5] + rowHeights[6] + rowHeights[7]);

    // Add centered text content
    rowY = tableStartY;
    const tableCenterX = pageWidth / 2;
    const leftColCenterX = margin + (colWidth / 2);
    const rightColCenterX = margin + colWidth + (colWidth / 2);
    
    // Row 1: Waters header
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    doc.text('WATERS OF SAMARAI ISLAND TO CAPE VOGEL & ALL MILNE BAY ISLANDS:', tableCenterX, rowY + 3, { align: 'center' });
    rowY += rowHeights[0];
    
    // Row 2: Waters content
    doc.setFont(undefined, 'normal');
    const watersLines = doc.splitTextToSize(watersContent, contentWidth - 10);
    watersLines.forEach((line, index) => {
      doc.text(line, tableCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    rowY += rowHeights[1];
    
    // Row 3: Two column headers
    doc.setFont(undefined, 'bold');
    doc.text('ALOTAU:', leftColCenterX, rowY + 3, { align: 'center' });
    doc.text('TROBRIAND ISLANDS:', rightColCenterX, rowY + 3, { align: 'center' });
    rowY += rowHeights[2];
    
    // Row 4: Two column content
    doc.setFont(undefined, 'normal');
    const alotauLines = doc.splitTextToSize(alotauContent, colWidth - 10);
    const trobriandLines = doc.splitTextToSize(trobriandContent, colWidth - 10);
    
    alotauLines.forEach((line, index) => {
      doc.text(line, leftColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    trobriandLines.forEach((line, index) => {
      doc.text(line, rightColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    rowY += rowHeights[3];
    
    // Row 5: Two column headers
    doc.setFont(undefined, 'bold');
    doc.text('MISIMA TOWN:', leftColCenterX, rowY + 3, { align: 'center' });
    doc.text('WOODLARK ISLANDS:', rightColCenterX, rowY + 3, { align: 'center' });
    rowY += rowHeights[4];
    
    // Row 6: Two column content
    doc.setFont(undefined, 'normal');
    const misimaLines = doc.splitTextToSize(misimaContent, colWidth - 10);
    const woodlarkLines = doc.splitTextToSize(woodlarkContent, colWidth - 10);
    
    misimaLines.forEach((line, index) => {
      doc.text(line, leftColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    woodlarkLines.forEach((line, index) => {
      doc.text(line, rightColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    rowY += rowHeights[5];
    
    // Row 7: Two column headers
    doc.setFont(undefined, 'bold');
    doc.text('SUDEST, NIMOWA & ROSSEL ISLANDS:', leftColCenterX, rowY + 3, { align: 'center' });
    doc.text('GOODENOUGH, FERGUSSON & NORMANBY ISLANDS:', rightColCenterX, rowY + 3, { align: 'center' });
    rowY += rowHeights[6];
    
    // Row 8: Two column content
    doc.setFont(undefined, 'normal');
    const sudestLines = doc.splitTextToSize(sudestContent, colWidth - 10);
    const goodenoughLines = doc.splitTextToSize(goodenoughContent, colWidth - 10);
    
    sudestLines.forEach((line, index) => {
      doc.text(line, leftColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    goodenoughLines.forEach((line, index) => {
      doc.text(line, rightColCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    rowY += rowHeights[7];
    
    // Row 9: Forecast header
    doc.setFont(undefined, 'bold');
    doc.text('FORECAST FOR MILNE BAY PROVINCE:', tableCenterX, rowY + 3, { align: 'center' });
    rowY += rowHeights[8];
    
    // Row 10: Forecast content
    doc.setFont(undefined, 'normal');
    const forecastLines = doc.splitTextToSize(forecastContent, contentWidth - 10);
    forecastLines.forEach((line, index) => {
      doc.text(line, tableCenterX, rowY + 2 + (index * 3.5), { align: 'center' });
    });
    
    y = rowY + rowHeights[9] + 8;

    // Add NB note below the table
    doc.setFont(undefined, 'italic');
    doc.setFontSize(7);
    doc.text('NB: Squally or gusty winds are expected to accompany areas with severe thunderstorms.', tableCenterX, y, { align: 'center' });
    y += 8;

  } catch (error) {
    console.error('Error drawing unified table:', error);
    doc.setFont(undefined, 'normal');
    doc.text('Error displaying weather table', 10, y);
    y += 10;
  }

  // ===== BOTTOM SECTION =====
  const bottomDivs = container.querySelectorAll(".bottom-end > div");
  const xPositions = [10, 35, 55, 75, 100, 130];

  bottomDivs.forEach((div, i) => {
    let text = div.textContent.trim();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(text, xPositions[i] || 10, y);
  });

  y += 3;
  addText("NNNN", "left", 8, "normal", [0, 0, 0]);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const currentDate = `${dd}${mm}${yy}`;

  const fileName = `MilneBayProvince_Forecast_for_Today(${currentDate}).pdf`;
  doc.save(fileName);
});