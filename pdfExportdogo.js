// pdfExport.js

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
  
  // ===== image header =====
  let headerY = 3;

  if (typeof img1 !== "undefined" && img1) {
      doc.addImage(img1, "PNG", 10, headerY + 2, 22, 15);
  }
  if (typeof img2 !== "undefined" && img2) {
      doc.addImage(img2, "PNG", pageWidth - 35, headerY + 2, 22, 13);
  }

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 139, 139);
  doc.text("PAPUA NEW GUINEA NATIONAL WEATHER SERVICE", pageWidth / 2, headerY + 5, { align: "center" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("P.O. Box 1240, BOROKO, National Capital District, Papua New Guinea", pageWidth / 2, headerY + 10, { align: "center" });
  doc.text("Telephone: (+675) 325 2788 or (+675) 325 5544   email: png.nws@gmail.com   Website: www.pngmet.gov.pg", pageWidth / 2, headerY + 14, { align: "center" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 139, 139);
  doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.setLineWidth(0.35);
  doc.line(10, headerY + 18, pageWidth - 10, headerY + 18);
  doc.setGState(new doc.GState({ opacity: 1 }));
  
  // ===== HEADER: left + right same line =====
  const headerLeft =
    container.querySelector("h4:first-of-type")?.textContent.trim() ||
    "ZCZC GOPNG";
  const headerRight =
    container.querySelector("#current-Date")?.textContent.trim() || "";

  doc.setFont("helvetica");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  doc.text(headerLeft, 10, y);
  doc.text(headerRight, pageWidth - 10, y, { align: "right" });

  y += 3;
  
  // ===== Centered headers =====
  addText("PNG OCEAN WATERS FORECASTS", "center", 10, "bold", [0, 91, 137]);
  addText("AFTERNOON TO TONIGHT", "center", 10, "bold", [0, 91, 137]);
  y += 2;

  addText(
    "FORECAST FOR THE OCEAN WATERS OF PAPUA NEW GUINEA FOR THE NEXT 24 HOURS VALID AT 2:00 PM AS ISSUED BY PAPUA NEW GUINEA NATIONAL WEATHER SERVICE.",
    "center",
    8,
    "bold",
    [0, 0, 0],
    3
  );
  y += 1.5;

  addText(
    "NB: FORECASTS ARE OUTSIDE THE 60 NAUTICAL MILES OR 111 KILOMETRES FROM THE COASTLINE.",
    "center",
    7,
    "italic",
    [0, 0, 0],
    2
  );
  y += 4;

  // ===== SYNOPTIC SITUATION heading (matching coastal waters layout) =====
  const synopticEl = container.querySelector("#dateSynops")?.closest("div");

  if (synopticEl) {
    const timeText =
      synopticEl.querySelector("span[style*='color']")?.textContent.trim() ||
      "10:00 AM";
    const dateSynops =
      container.querySelector("#dateSynops")?.textContent.trim() || "";
    const utcText =
      container.querySelector("#UTCdate")?.textContent.trim() || "";

    const prefix = "SYNOPTIC SITUATION AT ";
    const suffix =
      (dateSynops ? dateSynops + " " : "") +
      "[ " + utcText + "0000 UTC ]";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    let currentX = 10;

    doc.setTextColor(16, 91, 137);
    doc.text(prefix, currentX, y);
    currentX += doc.getTextWidth(prefix);

    doc.setTextColor(216, 41, 44);
    doc.text(timeText, currentX, y);
    currentX += doc.getTextWidth(timeText);

    doc.setTextColor(16, 91, 137);
    doc.text(" " + suffix, currentX, y);

    const completeHeadingWidth =
      doc.getTextWidth(prefix) +
      doc.getTextWidth(timeText) +
      doc.getTextWidth(" " + suffix);

    doc.setDrawColor(16, 91, 137);
    doc.setLineWidth(0.2);
    doc.line(10, y + 1, 10 + completeHeadingWidth, y + 1);

    y += 6;
  }

  // ===== Bullet textbox contents =====
  const bulletItems = container.querySelectorAll("#bulletTextbox li");
  bulletItems.forEach((li) => {
    doc.setFont("times", "italic");
    addText(String.fromCharCode(149) + " " + li.textContent.trim(), "left", 8, "italic", [0, 0, 0], 4);
  });
  y += 4;

  // ===== WARNINGS paragraph =====
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

    if (bodyLines.length > 0) {
      doc.text(bodyLines[0], startX + warningWidth + 1.5, y);
    }

    for (let i = 1; i < bodyLines.length; i++) {
      y += lineSpacing;
      doc.text(bodyLines[i], startX + 1, y);
    }

    y += 5;
  }
// pdfExport.js

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

      y += lineGap * 0.75; // very small gap between lines
    });
  }
  
  // ===== image header =====
  // === HEADER ===
  let headerY = 3; // move header close to top

  // Left logo
  if (typeof img1 !== "undefined" && img1) {
      doc.addImage(img1, "PNG", 10, headerY + 2, 22, 15);
  }
  // Right logo
  if (typeof img2 !== "undefined" && img2) {
      doc.addImage(img2, "PNG", pageWidth - 35, headerY + 2, 22, 13);
  }

  // Organization name
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 139, 139); // dark cyan
  doc.text("PAPUA NEW GUINEA NATIONAL WEATHER SERVICE", pageWidth / 2, headerY + 5, { align: "center" });

  // Contact info (all dark cyan now)
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("P.O. Box 1240, BOROKO, National Capital District, Papua New Guinea", pageWidth / 2, headerY + 10, { align: "center" });
  doc.text("Telephone: (+675) 325 2788 or (+675) 325 5544   email: png.nws@gmail.com   Website: www.pngmet.gov.pg", pageWidth / 2, headerY + 14, { align: "center" });

  // Horizontal line under header (dark cyan, 50% opacity)
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 139, 139);
  doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.setLineWidth(0.35); // thicker line (0.5 mm)
  doc.line(10, headerY + 18, pageWidth - 10, headerY + 18);
  doc.setGState(new doc.GState({ opacity: 1 }));
  
  // ===== HEADER: left + right same line (black text) =====
  const headerLeft =
    container.querySelector("h4:first-of-type")?.textContent.trim() ||
    "ZCZC GOPNG";
  const headerRight =
    container.querySelector("#current-Date")?.textContent.trim() || "";

  // Black text for top line
  doc.setFont("helvetica");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // black

  // Left: ZCZC GOPNG
  doc.text(headerLeft, 10, y);

  // Right: current date
  doc.text(headerRight, pageWidth - 10, y, { align: "right" });

  y += 3; // move down for next line
  
  // ===== Centered headers =====
  addText("PNG OCEAN WATERS FORECASTS", "center", 10, "bold", [0, 91, 137]);
  addText("AFTERNOON TO TONIGHT", "center", 10, "bold", [0, 91, 137]);
  y += 2;

  // Two lines very close together
  addText(
    "FORECAST FOR THE OCEAN WATERS OF PAPUA NEW GUINEA",
    "center",
    8,
    "bold",  // <-- make it bold
    [0, 0, 0],
    3
  );
  y += 1; // tiny gap
  const beforeText = "FOR THE NEXT 24 HOURS VALID AT ";
  const redTime = " 8:00 PM";
  const afterText = " AS ISSUED BY PAPUA NEW GUINEA NATIONAL WEATHER SERVICE.";

  // Setup font and alignment
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  // Measure total width to center the entire line
  const totalWidth =
    (doc.getStringUnitWidth(beforeText + redTime + afterText) * 8) /
    doc.internal.scaleFactor;
  const startX = (pageWidth - totalWidth) / 2;

  // Draw the black start
  doc.setTextColor(0, 0, 0);
  doc.text(beforeText, startX, y);

  // Measure where the red time starts
  const beforeWidth =
    (doc.getStringUnitWidth(beforeText) * 8) / doc.internal.scaleFactor;

  // Draw red time
  doc.setTextColor(216, 41, 44); // red (#D8292C)
  doc.text(redTime, startX + beforeWidth, y);

  // Draw the rest in black
  const redWidth =
    (doc.getStringUnitWidth(redTime) * 8) / doc.internal.scaleFactor;
  doc.setTextColor(0, 0, 0);
  doc.text(afterText, startX + beforeWidth + redWidth, y);

  y += 3;
  
  // Small gap before NB line
  y += 1.5;
  addText(
    "NB: FORECASTS ARE OUTSIDE THE 60 NAUTICAL MILES OR 111 KILOMETRES FROM THE COASTLINE.",
    "center",
    7,        // smaller font size
    "italic", // italic style
    [0, 0, 0], 
    2         // optional lineGap
  );
  y += 4;

  // ===== SYNOPTIC SITUATION heading (blue + underlined, red time) =====
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

    // Keep "AT", remove "OF"
    const beforeTime = "SYNOPTIC SITUATION AT ";
    const afterTime = ` ${dateSynops ? dateSynops + " " : ""}[ ${utcText}1000 UTC ]`;

    // ===== Draw the blue line and underline =====
    const lineText = beforeTime + timeText + afterTime;
    doc.setFontSize(8);
    doc.setFont(undefined, "bold");
    doc.setTextColor(16, 91, 137);

    // Draw base line in blue
    const startX = 10;
    doc.text(beforeTime, startX, y);

    // Draw red time immediately after
    const beforeWidth =
      (doc.getStringUnitWidth(beforeTime) * 8) / doc.internal.scaleFactor;
    doc.setTextColor(216, 41, 44); // red
    doc.text(timeText, startX + beforeWidth, y);

    // Draw remainder in blue
    const timeWidth =
      (doc.getStringUnitWidth(timeText) * 8) / doc.internal.scaleFactor;
    doc.setTextColor(16, 91, 137);
    doc.text(afterTime, startX + beforeWidth + timeWidth, y);

    // Underline entire line
    const totalWidth =
      (doc.getStringUnitWidth(lineText) * 8) / doc.internal.scaleFactor;
    doc.setDrawColor(16, 91, 137);
    doc.setLineWidth(0.2);
    doc.line(startX, y + 1, startX + totalWidth, y + 1);

    y += 6; // space after heading
  }

// ===== Bullet textbox contents =====
const bulletItems = container.querySelectorAll("#bulletTextbox li");
bulletItems.forEach((li) => {
  // Use Times New Roman (built-in name: "times")
  doc.setFont("times", "italic");
  // Use ASCII bullet character (decimal 149)
  addText(String.fromCharCode(149) + " " + li.textContent.trim(), "left", 8, "italic", [0, 0, 0], 4);
});
y += 4;


  // ===== WARNINGS paragraph =====
  // === WARNINGS Section: Text starts on same line as "WARNINGS :" with tighter spacing ===
  const warningContainer = container.querySelector(".warnings");
  if (warningContainer) {
    const w1 = warningContainer.children[0]?.textContent.trim() || "WARNINGS :";
    const w2 = warningContainer.children[1]?.textContent.trim() || "";

    const startX = 10;
    const lineSpacing = 3; // slightly tighter than default (was 4)

    // "WARNINGS :" in bold red
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(216, 41, 44);
    doc.text(w1, startX, y);

    // Measure width of "WARNINGS :" to start next text right after it
    const warningWidth = (doc.getStringUnitWidth(w1) * 7) / doc.internal.scaleFactor;

    // Normal italic text (black)
    doc.setFont("helvetica", "italic");
    doc.setTextColor(0, 0, 0);

    const availableWidth = pageWidth - startX - warningWidth - 10;
    const bodyLines = doc.splitTextToSize(w2, availableWidth);

    // First line appears very close to "WARNINGS :"
    doc.text(bodyLines[0], startX + warningWidth + 1.5, y); // reduced horizontal gap

    // Remaining lines use minimal vertical spacing
    for (let i = 1; i < bodyLines.length; i++) {
      y += lineSpacing; // 3 pt spacing between lines
      doc.text(bodyLines[i], startX + 1, y); // small indent for visual alignment
    }

    y += 5; // slightly smaller space before next section (was 5)
  }

  // ===== FORECAST FOR NEXT =====
  // === Bold Text with Normal Black Underline ===
  const forecastLine = "FORECAST FOR THE OCEAN WATERS OF PAPUA NEW GUINEA FOR THE NEXT 24 HOURS VALID AT 08:00 PM.";

  // Set bold black text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  // Draw the text
  const xStart = 10;
  doc.text(forecastLine, xStart, y);

  // Measure text width for underline
  const textWidth = (doc.getStringUnitWidth(forecastLine) * 8) / doc.internal.scaleFactor;

  // Draw a clean, thin black underline
  doc.setDrawColor(0, 0, 0); // underline color = black
  doc.setLineWidth(0.2);     // thin line (not bold)
  doc.line(xStart, y + 1.2, xStart + textWidth, y + 1.2);

  y += 6; // move down for next section
  
  // ===== SEA AREAS =====
  // UPDATED: Changed selector from '[id^="area"]' to '[id^="sea-area"]'
  const areas = container.querySelectorAll('[id^="sea-area"]');
  areas.forEach((area) => {
    const title = area.querySelector("span")?.textContent.trim();
    if (title) addText(title, "left", 8, "bold", [0, 91, 137]);

    // Each table row printed as a sentence
    area.querySelectorAll("table tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      const line = Array.from(tds)
        .map((td) => td.textContent.trim())
        .filter(Boolean)
        .join(" ");
      if (line) addText(line, "left", 8, "normal", [0, 0, 0], 4);
    });
    y += 3; // space after each area
  });

  // ===== NB THUNDER =====
  addText(
    "NB: Squally or gusty winds are expected to accompany areas with severe thunderstorms.",
    "left",
    8
  );
  y += 2;

  // ===== BOTTOM END =====
  // ===== Bottom End Line: Date / Time / UTC / Duty Forecaster =====
  const bottomDivs = container.querySelectorAll(".bottom-end > div");

  // X positions for better spacing (adjust as needed)
  const xPositions = [10, 35, 55, 75, 100, 130];

  bottomDivs.forEach((div, i) => {
    let text = div.textContent.trim();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(text, xPositions[i] || 10, y); // use spacing
  });

  y += 3;
  addText("NNNN", "left", 8, "normal", [0, 0, 0]);

  // Save PDF
  // === Dynamic filename: "PNGCoastalWaters_Forecast(ddmmyy).pdf" ===
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2); // last two digits of year
  const dateStr = `${day}${month}${year}`;
  const fileName = `PNGCoastalWaters_Forecast@2pm_${dateStr}.pdf`;

  doc.save(fileName);
});
  // ===== FORECAST FOR NEXT 24 HOURS =====
  const forecastPrefix = "FORECAST FOR THE OCEAN WATERS OF PAPUA NEW GUINEA FOR THE NEXT 24 HOURS VALID AT ";
  const forecastTime = " 02:00 PM:";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  const xStartForecast = 10;
  doc.setTextColor(0, 56, 125);
  doc.text(forecastPrefix, xStartForecast, y);

  const prefixWidth = doc.getTextWidth(forecastPrefix);
  doc.setTextColor(216, 41, 44);
  doc.text(forecastTime, xStartForecast + prefixWidth, y);

  const totalForecastWidth = prefixWidth + doc.getTextWidth(forecastTime);
  doc.setDrawColor(7, 56, 125);
  doc.setLineWidth(0.2);
  doc.line(
    xStartForecast,
    y + 1.2,
    xStartForecast + totalForecastWidth,
    y + 1.2
  );

  y += 6;
  
  // ===== SEA AREAS (Bold Prefix Formatting for WINDS, SEAS, WEATHER with Blue Sea Headings) =====
  const areas = container.querySelectorAll('[id^="sea-area"]');
  areas.forEach((area) => {
    const title = area.querySelector("span")?.textContent.trim();
    if (title) addText(title, "left", 8, "bold", [0, 91, 137]); // Blue color for sea names

    area.querySelectorAll("table tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length === 0) return;

      const leftText = tds[0].textContent.trim();
      const div2Text = tds[1] ? tds[1].textContent.trim() : "";

      let fullLine = leftText;
      if (div2Text) {
        fullLine += (fullLine.endsWith(",") ? " " : ", ") + div2Text;
      }
      if (!fullLine) return;

      const upperLine = fullLine.toUpperCase();
      let prefix = "";
      let restOfLine = fullLine;

      if (upperLine.startsWith("WINDS")) {
        prefix = "WINDS:";
        restOfLine = fullLine.replace(/^.*?(WINDS:?)\s*/i, "");
      } else if (upperLine.startsWith("SEAS")) {
        prefix = "SEAS:";
        restOfLine = fullLine.replace(/^.*?(SEAS:?)\s*/i, "");
      } else if (upperLine.startsWith("WEATHER")) {
        prefix = "WEATHER:";
        restOfLine = fullLine.replace(/^.*?(WEATHER:?)\s*/i, "");
      }

      if (prefix) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        const prefixWidth = doc.getTextWidth(prefix + " ");
        const startXArea = 10;

        doc.text(prefix + " ", startXArea, y);

        doc.setFont("helvetica", "normal");
        const restLines = doc.splitTextToSize(
          restOfLine,
          pageWidth - 20 - prefixWidth
        );

        restLines.forEach((line, idx) => {
          if (idx === 0) {
            doc.text(line, startXArea + prefixWidth, y);
          } else {
            y += 5 * 0.75;
            doc.text(line, startXArea, y);
          }
        });

        y += 5 * 0.75;
      } else {
        addText(fullLine, "left", 8, "normal", [0, 0, 0], 4);
      }
    });

    y += 3;
  });

  // ===== NB THUNDER =====
  addText(
    "NB: Squally or gusty winds are expected to accompany areas with severe thunderstorms.",
    "left",
    8,
    "italic"
  );
  y += 2;

  // ===== BOTTOM END =====
  const bottomDivs = container.querySelectorAll(".bottom-end > div");
  const xPositions = [10, 38, 56, 75, 102, 130];

  bottomDivs.forEach((div, i) => {
    let text = div.textContent.trim();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(text, xPositions[i] || 10, y);
  });

  y += 3;
  addText("NNNN", "left", 8, "normal", [0, 0, 0]);

  // Save PDF
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;
  const fileName = `PNGOceanWaters_Forecast@2pm_${dateStr}.pdf`;

  doc.save(fileName);
});