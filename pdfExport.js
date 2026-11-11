
document.getElementById("savePdfBtn").addEventListener("click", function () {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    let y = 25;

    const container = document.querySelector(".container");

    if (!container) {
      alert("Container not found!");
      return;
    }

    // ===== CLEAN TEXT =====
    function cleanPdfText(value) {
      return String(value || "")
        .replace(/[\u00FF\u00FD]/g, "")
        .replace(/\uFEFF/g, "")
        .replace(/\uFFFD/g, "")
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // ===== TEXT HELPER =====
    function addText(
      text,
      align = "left",
      fontSize = 8,
      fontStyle = "normal",
      color = [0, 0, 0],
      lineGap = 5,
      underline = false
    ) {
      text = cleanPdfText(text);
      if (!text) return;

      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(text, pageWidth - 20);

      lines.forEach((line) => {
        let x = 10;

        if (align === "center") {
          x = pageWidth / 2;
        } else if (align === "right") {
          x = pageWidth - 10;
        }

        doc.text(line, x, y, { align });

        if (underline) {
          const textWidth = doc.getTextWidth(line);
          let lineX = x;

          if (align === "center") {
            lineX = x - textWidth / 2;
          } else if (align === "right") {
            lineX = x - textWidth;
          }

          doc.setDrawColor(...color);
          doc.setLineWidth(0.2);
          doc.line(lineX, y + 1, lineX + textWidth, y + 1);
        }

        y += lineGap * 0.75;
      });
    }

    // ===== HEADER =====
    let headerY = 3;

    if (typeof img1 !== "undefined" && img1) {
      doc.addImage(img1, "PNG", 10, headerY + 2, 22, 15);
    }

    if (typeof img2 !== "undefined" && img2) {
      doc.addImage(img2, "PNG", pageWidth - 35, headerY + 2, 22, 13);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 139, 139);

    doc.text(
      "PAPUA NEW GUINEA NATIONAL WEATHER SERVICE",
      pageWidth / 2,
      headerY + 5,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      "P.O. Box 1240, BOROKO, National Capital District, Papua New Guinea",
      pageWidth / 2,
      headerY + 10,
      { align: "center" }
    );

    doc.text(
      "Telephone: (+675) 325 2788 or (+675) 325 5544    email: png.nws@gmail.com    Website: www.pngmet.gov.pg",
      pageWidth / 2,
      headerY + 14,
      { align: "center" }
    );

    doc.setLineWidth(0.35);
    doc.setDrawColor(0, 139, 139);
    doc.setGState(new doc.GState({ opacity: 0.5 }));
    doc.line(10, headerY + 18, pageWidth - 10, headerY + 18);
    doc.setGState(new doc.GState({ opacity: 1 }));

    // ===== TOP LEFT AND RIGHT HEADER =====
    const headerLeft = cleanPdfText(
      container.querySelector("h4:first-of-type")?.textContent || "ZCZC GOPNG"
    );

    const headerRight = cleanPdfText(
      container.querySelector("#current-Date")?.textContent || ""
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(headerLeft, 10, y);
    doc.text(headerRight, pageWidth - 10, y, { align: "right" });

    y += 3;

    // ===== CENTERED HEADINGS =====
    addText(
      "PNG COASTAL WATERS FORECASTS",
      "center",
      10,
      "bold",
      [0, 91, 137]
    );

    addText(
      "FOR TODAY",
      "center",
      10,
      "bold",
      [0, 91, 137]
    );

    y += 2;

    addText(
      "FORECAST FOR THE SMALL CRAFTS WITHIN THE COASTAL WATERS OF PAPUA NEW GUINEA",
      "center",
      8,
      "bold",
      [0, 0, 0],
      3
    );

    y += 1;

    // ===== ISSUED TIME HEADING =====
    const beforeText = "FOR THE NEXT 24 HOURS VALID AT ";
    const redTime = " 8:00 AM";
    const afterText =
      " AS ISSUED BY PAPUA NEW GUINEA NATIONAL WEATHER SERVICE.";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    const totalWidth =
      doc.getTextWidth(beforeText) +
      doc.getTextWidth(redTime) +
      doc.getTextWidth(afterText);

    const startX = (pageWidth - totalWidth) / 2;

    doc.setTextColor(0, 0, 0);
    doc.text(beforeText, startX, y);

    const beforeWidth = doc.getTextWidth(beforeText);

    doc.setTextColor(216, 41, 44);
    doc.text(redTime, startX + beforeWidth, y);

    const redWidth = doc.getTextWidth(redTime);

    doc.setTextColor(0, 0, 0);
    doc.text(afterText, startX + beforeWidth + redWidth, y);

    y += 3;
    y += 1.5;

    addText(
      "NB: FORECASTS AREA WITHIN 60 NAUTICAL MILES OR 111 KILOMETRES FROM THE COASTLINE.",
      "center",
      7,
      "italic",
      [0, 0, 0],
      2
    );

    y += 4;

    // ===== SYNOPTIC SITUATION HEADING =====
    const synopticEl = container.querySelector("#dateSynops")?.closest("div");

    if (synopticEl) {
      const timeText = cleanPdfText(
        synopticEl.querySelector("span[style*='color']")?.textContent ||
        "10:00 AM"
      );

      const dateSynops = cleanPdfText(
        container.querySelector("#dateSynops")?.textContent || ""
      );

      const utcDate = cleanPdfText(
        container.querySelector("#UTCdate")?.textContent || ""
      );

      const prefix = "SYNOPTIC SITUATION AT ";
      const suffix =
        (dateSynops ? dateSynops + " " : "") +
        "[ " + utcDate + "1800 UTC ]";

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

    // ===== BULLET TEXTBOX CONTENTS =====
    // Filled circular bullets drawn as PDF shapes.
    // This avoids font encoding problems with bullet characters.
    const bulletItems = container.querySelectorAll("#bulletTextbox li");

    bulletItems.forEach((li) => {
      const bulletText = cleanPdfText(li.textContent);

      if (bulletText) {
        doc.setFont("times", "italic");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        const bulletX = 10;
        const textX = 12;
        const availableWidth = pageWidth - textX - 10;

        const lines = doc.splitTextToSize(
          bulletText,
          availableWidth
        );

        // Draw the circle alongside the first line.
        doc.setFillColor(0, 0, 0);
        doc.circle(bulletX, y - 0.8, 0.4, "F");

        // Print the bullet text.
        lines.forEach((line) => {
          doc.text(line, textX, y);
          y += 3;
        });
      }
    });

    y += 4;

    // ===== WARNINGS PARAGRAPH =====
    const warningContainer = container.querySelector(".warnings");

    if (warningContainer) {
      const w1 = cleanPdfText(
        warningContainer.children[0]?.textContent || "WARNINGS :"
      );

      const w2 = cleanPdfText(
        warningContainer.children[1]?.textContent || ""
      );

      const startXWarn = 10;
      const lineSpacing = 3;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(216, 41, 44);

      doc.text(w1, startXWarn, y);

      const warningWidth = doc.getTextWidth(w1);

      doc.setFont("helvetica", "italic");
      doc.setTextColor(0, 0, 0);

      const availableWidth =
        pageWidth - startXWarn - warningWidth - 10;

      const bodyLines = doc.splitTextToSize(w2, availableWidth);

      if (bodyLines.length > 0) {
        doc.text(
          bodyLines[0],
          startXWarn + warningWidth + 1.5,
          y
        );
      }

      for (let i = 1; i < bodyLines.length; i++) {
        y += lineSpacing;
        doc.text(bodyLines[i], startXWarn + 1, y);
      }

      y += 5;
    }

    // ===== FORECAST FOR NEXT 24 HOURS =====
    const forecastLine =
      "FORECAST FOR THE COASTAL WATERS OF PAPUA NEW GUINEA FOR THE NEXT 24 HOURS VALID AT 08:00 AM.";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    const xStartForecast = 10;
    doc.text(forecastLine, xStartForecast, y);

    const textWidthForecast = doc.getTextWidth(forecastLine);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(
      xStartForecast,
      y + 1.2,
      xStartForecast + textWidthForecast,
      y + 1.2
    );

    y += 6;

    // ===== SEA AREAS =====
    const areas = container.querySelectorAll('[id^="area"]');

    areas.forEach((area) => {
      const title = cleanPdfText(
        area.querySelector("span")?.textContent || ""
      );

      if (title) {
        addText(title, "left", 8, "bold", [0, 91, 137]);
      }

      area.querySelectorAll("table tr").forEach((tr) => {
        const tds = tr.querySelectorAll("td");

        if (tds.length === 0) return;

        const leftText = cleanPdfText(tds[0].textContent);
        const div2Text = tds[1]
          ? cleanPdfText(tds[1].textContent)
          : "";

        let fullLine = leftText;

        if (div2Text) {
          fullLine +=
            (fullLine.endsWith(",") ? " " : ", ") +
            div2Text;
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

    // ===== THUNDERSTORM NOTE =====
    addText(
      "NB: Squally or gusty winds are expected to accompany areas with severe thunderstorms.",
      "left",
      8
    );

    y += 2;

    // ===== BOTTOM END =====
    const bottomDivs = container.querySelectorAll(".bottom-end > div");
    const xPositions = [10, 35, 55, 75, 100, 130];

    bottomDivs.forEach((div, i) => {
      const text = cleanPdfText(div.textContent);

      if (!text) return;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      doc.text(text, xPositions[i] || 10, y);
    });

    y += 3;

    addText("NNNN", "left", 8, "normal", [0, 0, 0]);

    // ===== FILE NAME =====
    const now = new Date();

    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    const currentDate = `${dd}${mm}${yy}`;

    const fileName =
      `PNGCoastalWaters_Forecast@2pm(${currentDate}).pdf`;

    // ===== SAVE PDF =====
    doc.save(fileName);

  } catch (error) {
    alert("Error generating PDF: " + error.message);
    console.error("PDF export error:", error);
  }
});
