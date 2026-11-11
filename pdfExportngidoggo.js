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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(headerLeft, 10, y);
  doc.text(headerRight, pageWidth - 10, y, { align: "right" });
  y += 5;

  addText("NEW GUINEA ISLANDS REGIONAL WEATHER FORECASTS", "center", 10, "bold", [0, 91, 137]);
  addText("FOR MORNING & TODAY", "center", 10, "bold", [0, 91, 137]);
  y += 5;

  // Forecast validity line
  const beforeText = "FORECASTS VALID FOR THE NEXT 24 HOURS AT  ";
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
  const timeText = container.querySelector('span[style*="#D8292C"]')?.textContent.trim() || "04:00 AM";
  const dateSynops = container.querySelector("#dateSynops")?.textContent.trim() || "";
  const utcText = container.querySelector("#UTCdate")?.textContent.trim() || "";

  const beforeTime = "SYNOPTIC SITUATION AT ";
  const afterTime = ` ${dateSynops ? dateSynops + " " : ""}[ ${utcText}1800 UTC ]`;

  const lineText = beforeTime + timeText + afterTime;
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.setTextColor(16, 91, 137);

  const synopStartX = 10;
  doc.text(beforeTime, synopStartX, y);

  const beforeWidthSynop = (doc.getStringUnitWidth(beforeTime) * 8) / doc.internal.scaleFactor;
  doc.setTextColor(216, 41, 44);
  doc.text(timeText, synopStartX + beforeWidthSynop, y);

  const timeWidth = (doc.getStringUnitWidth(timeText) * 8) / doc.internal.scaleFactor;
  doc.setTextColor(16, 91, 137);
  doc.text(afterTime, synopStartX + beforeWidthSynop + timeWidth, y);

  const totalWidthSynop = (doc.getStringUnitWidth(lineText) * 8) / doc.internal.scaleFactor;
  doc.setDrawColor(16, 91, 137);
  doc.setLineWidth(0.2);
  doc.line(synopStartX, y + 1, synopStartX + totalWidthSynop, y + 1);

  y += 6;

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

    const wStartX = 10;
    const lineSpacing = 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(216, 41, 44);
    doc.text(w1, wStartX, y);
    const warningWidth = (doc.getStringUnitWidth(w1) * 7) / doc.internal.scaleFactor;

    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 0, 0);
    const availableWidth = pageWidth - wStartX - warningWidth - 10;
    const bodyLines = doc.splitTextToSize(w2, availableWidth);

    if (bodyLines.length > 0) {
      doc.text(bodyLines[0], wStartX + warningWidth + 1.5, y);
    }

    for (let i = 1; i < bodyLines.length; i++) {
      y += lineSpacing;
      doc.text(bodyLines[i], wStartX + 1, y);
    }

    y += 5;
  }

  // ===== SINGLE UNIFIED TABLE =====
  try {
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const colWidth = contentWidth / 2;
    
    function getSeaAreaContent(areaName) {
      const tableCell = document.querySelector('.minor-weather-table tr:nth-child(2) td');
      if (!tableCell) return '';
      
      let content = '';
      const children = Array.from(tableCell.children);
      
      if (areaName.includes('MANUS')) {
        for (let child of children) {
          if (child.tagName === 'DIV' && child.style.backgroundColor) {
            break; 
          }
          if (child.classList && child.classList.contains('minor-note-line')) {
            const text = child.textContent.trim();
            if (text) content += text + '\n';
          }
        }
      } else {
        let found = false;
        for (let child of children) {
          if (child.tagName === 'DIV' && child.textContent.includes(areaName)) {
            found = true;
            continue;
          }
          if (found) {
            if (child.tagName === 'DIV' && child.style.backgroundColor) {
              break; 
            }
            if (child.classList && child.classList.contains('minor-note-line')) {
              const text = child.textContent.trim();
              if (text) content += text + '\n';
            }
          }
        }
      }
      return content.trim();
    }

    function getCellNoteLines(cellElement) {
      if (!cellElement) return [];
      const noteDivs = cellElement.querySelectorAll('.minor-note-line');
      let lines = [];
      if (noteDivs.length > 0) {
        noteDivs.forEach(div => {
          const t = div.textContent.trim();
          if (t) lines.push(t);
        });
      } else {
        const t = cellElement.textContent.trim();
        if (t) lines.push(t);
      }
      return lines;
    }

    function getTextHeightForLines(linesArray, width) {
      let totalLinesCount = 0;
      linesArray.forEach(item => {
        const wrapped = doc.splitTextToSize(item, width - 6);
        totalLinesCount += wrapped.length;
      });
      return (totalLinesCount * 3.5) + 4;
    }

    function getTextHeight(text, width) {
      const lines = doc.splitTextToSize(text, width - 10);
      return (lines.length * 3.5) + 3;
    }

    // Set table styling
    doc.setDrawColor(0, 91, 137); 
    doc.setLineWidth(0.3);
    
    const tableStartY = y;
    const rowHeights = [];
    
    const manusContent = getSeaAreaContent('WATERS OF MANUS');
    const newIrelandContent = getSeaAreaContent('WATERS OF NEW IRELAND');
    const westBritanniaContent = getSeaAreaContent('WATERS OF WEST NEW BRITAIN');
    const bougainvilleContent = getSeaAreaContent('WATERS OF BOUGANVILLE');

    rowHeights.push(5);
    rowHeights.push(getTextHeight(manusContent, contentWidth));
    rowHeights.push(5);
    rowHeights.push(getTextHeight(newIrelandContent, contentWidth));
    rowHeights.push(5);
    rowHeights.push(getTextHeight(westBritanniaContent, contentWidth));
    rowHeights.push(5);
    rowHeights.push(getTextHeight(bougainvilleContent, contentWidth));

    const lorengauCell = document.querySelector('.minor-weather-table tr:nth-child(4) td:first-child');
    const kaviengCell = document.querySelector('.minor-weather-table tr:nth-child(4) td:last-child');
    const lorengauLines = getCellNoteLines(lorengauCell);
    const kaviengLines = getCellNoteLines(kaviengCell);

    rowHeights.push(5);
    rowHeights.push(Math.max(
      getTextHeightForLines(lorengauLines, colWidth),
      getTextHeightForLines(kaviengLines, colWidth)
    ));

    const kokopoCell = document.querySelector('.minor-weather-table tr:nth-child(6) td:first-child');
    const rabaulCell = document.querySelector('.minor-weather-table tr:nth-child(6) td:last-child');
    const kokopoLines = getCellNoteLines(kokopoCell);
    const rabaulLines = getCellNoteLines(rabaulCell);

    rowHeights.push(5);
    rowHeights.push(Math.max(
      getTextHeightForLines(kokopoLines, colWidth),
      getTextHeightForLines(rabaulLines, colWidth)
    ));

    const kimbeCell = document.querySelector('.minor-weather-table tr:nth-child(8) td:first-child');
    const bukaCell = document.querySelector('.minor-weather-table tr:nth-child(8) td:last-child');
    const kimbeLines = getCellNoteLines(kimbeCell);
    const bukaLines = getCellNoteLines(bukaCell);

    rowHeights.push(5);
    rowHeights.push(Math.max(
      getTextHeightForLines(kimbeLines, colWidth),
      getTextHeightForLines(bukaLines, colWidth)
    ));

    const forecastContent = document.querySelector('.minor-weather-table tr:nth-child(10) td')?.textContent.trim() || '';
    rowHeights.push(5);
    rowHeights.push(getTextHeight(forecastContent, contentWidth));

    let rowY = tableStartY;
    doc.setLineWidth(0.1);

    for (let i = 0; i < rowHeights.length; i++) {
      const rowHeight = rowHeights[i];
      if (i % 2 === 1) {
        doc.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight);
      }
      if (i >= 8 && i <= 13) {
        doc.line(margin + colWidth, rowY, margin + colWidth, rowY + rowHeight);
      }
      rowY += rowHeight;
    }

    doc.setLineWidth(0.3);
    doc.rect(margin, tableStartY, contentWidth, rowY - tableStartY);

    doc.setLineWidth(0.1);
    const regionalStartY = tableStartY + rowHeights.slice(0, 8).reduce((a, b) => a + b, 0);
    const regionalHeight = rowHeights.slice(8, 14).reduce((a, b) => a + b, 0);
    doc.line(margin + colWidth, regionalStartY, margin + colWidth, regionalStartY + regionalHeight);

    rowY = tableStartY;

    const seaAreaHeaders = [
      'WATERS OF MANUS AND ITS WESTERN GROUP OF ISLANDS:',
      'WATERS OF NEW IRELAND TO EAST NEW BRITAIN:',
      'WATERS OF WEST NEW BRITAIN:',
      'WATERS OF BOUGANVILLE:'
    ];
    
    const seaAreaContents = [manusContent, newIrelandContent, westBritanniaContent, bougainvilleContent];

    for (let i = 0; i < seaAreaHeaders.length; i++) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(8);
      // Center header text
      doc.text(seaAreaHeaders[i], pageWidth / 2, rowY + 3, { align: 'center' });
      rowY += rowHeights[i * 2];

      doc.setFont(undefined, 'normal');
      const contentLines = doc.splitTextToSize(seaAreaContents[i], contentWidth - 10);
      contentLines.forEach((line, index) => {
        // Center content text lines
        doc.text(line, pageWidth / 2, rowY + 2 + (index * 3.5), { align: 'center' });
      });
      rowY += rowHeights[i * 2 + 1];
    }

    // ===== POPULATE REGIONAL PAIRS (Centered Alignment) =====
    const regionalPairs = [
      { left: 'LORENGAU:', right: 'KAVIENG:', leftLines: lorengauLines, rightLines: kaviengLines },
      { left: 'KOKOPO:', right: 'RABAUL:', leftLines: kokopoLines, rightLines: rabaulLines },
      { left: 'KIMBE:', right: 'BUKA:', leftLines: kimbeLines, rightLines: bukaLines }
    ];

    const leftColCenterX = margin + (colWidth / 2);
    const rightColCenterX = margin + colWidth + (colWidth / 2);

    for (let i = 0; i < regionalPairs.length; i++) {
      const pair = regionalPairs[i];
      const rowIndex = 8 + (i * 2);

      // Header row (centered in each column)
      doc.setFont(undefined, 'bold');
      doc.setFontSize(8);
      doc.text(pair.left, leftColCenterX, rowY + 3, { align: 'center' });
      doc.text(pair.right, rightColCenterX, rowY + 3, { align: 'center' });
      rowY += rowHeights[rowIndex];

      // Content row
      doc.setFont(undefined, 'normal');

      // Left column lines centered
      let leftY = rowY + 2.5;
      pair.leftLines.forEach((item) => {
        const lines = doc.splitTextToSize(item, colWidth - 6);
        lines.forEach((line) => {
          doc.text(line, leftColCenterX, leftY, { align: 'center' });
          leftY += 3.5;
        });
      });

      // Right column lines centered
      let rightY = rowY + 2.5;
      pair.rightLines.forEach((item) => {
        const lines = doc.splitTextToSize(item, colWidth - 6);
        lines.forEach((line) => {
          doc.text(line, rightColCenterX, rightY, { align: 'center' });
          rightY += 3.5;
        });
      });

      rowY += rowHeights[rowIndex + 1];
    }

    // Forecast Section
    doc.setFont(undefined, 'bold');
    doc.text('FORECAST FOR NEW GUINEA ISLANDS:', pageWidth / 2, rowY + 3, { align: 'center' });
    rowY += rowHeights[14];

    doc.setFont(undefined, 'normal');
    const forecastLines = doc.splitTextToSize(forecastContent, contentWidth - 10);
    forecastLines.forEach((line, index) => {
      doc.text(line, pageWidth / 2, rowY + 2 + (index * 3.5), { align: 'center' });
    });

    y = rowY + rowHeights[15] + 8;

    doc.setFont(undefined, 'italic');
    doc.setFontSize(7);
    doc.text('NB: Squally or gusty winds are expected to accompany areas with severe thunderstorms.', pageWidth / 2, y, { align: 'center' });
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

  const fileName = `NewGuineaIslands_Forecast_for_Today(${currentDate}).pdf`;
  doc.save(fileName);
});