document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    
    if (!document.getElementById('issuanceDate').value) {
        document.getElementById('issuanceDate').value = formattedDate;
    }
    if (!document.getElementById('synopDate').value) {
        document.getElementById('synopDate').value = formattedDate;
    }
    
    updateUTC();
    loadData();
});

function addBulletField(value = '') {
    const container = document.getElementById('bulletContainer');
    const div = document.createElement('div');
    div.className = 'bullet-item';
    div.innerHTML = `<input type="text" class="input-flex bullet-input" value="${value}">`;
    container.appendChild(div);
}

function updateUTC() {
    const dateVal = document.getElementById('synopDate').value;
    const timeVal = document.getElementById('synopTime').value;
    if (!dateVal || !timeVal) return;

    // PNG standard: 10:00 AM local = 0000Z
    const [year, month, day] = dateVal.split('-');
    const [h, m] = timeVal.split(':').map(Number);

    let baseDate = new Date(Date.UTC(year, month - 1, day, h, m));
    baseDate.setUTCHours(baseDate.getUTCHours() - 10);

    const utcDay = String(baseDate.getUTCDate()).padStart(2, '0');
    const utcHour = String(baseDate.getUTCHours()).padStart(2, '0');
    const utcMin = String(baseDate.getUTCMinutes()).padStart(2, '0');

    document.getElementById('utcTime').value = `${utcDay}${utcHour}${utcMin}Z`;
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime12H(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${m} ${period}`;
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    let y = 6;

    // --- LOGOS ---
    if (typeof img1 !== "undefined" && img1) {
        doc.addImage(img1, "PNG", 10, y, 22, 18);
    }
    if (typeof img2 !== "undefined" && img2) {
        doc.addImage(img2, "PNG", pageWidth - 32, y, 22, 15);
    }

    // --- INSTITUTIONAL HEADER ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 139, 139);
    doc.text("DEPARTMENT OF TRANSPORT", pageWidth / 2, y + 4, { align: "center" });
    doc.text("PAPUA NEW GUINEA NATIONAL WEATHER SERVICE", pageWidth / 2, y + 8, { align: "center" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("P O Box 1240 Boroko NCD PNG", pageWidth / 2, y + 12, { align: "center" });
    doc.text("TEL: 3252788 / 3255544 | FAX: 3252740 / 3255201 | E-mail: png.nws@gmail.com", pageWidth / 2, y + 15, { align: "center" });
    doc.text("Website: www.pngmet.gov.pg", pageWidth / 2, y + 18, { align: "center" });

    doc.setLineWidth(0.4);
    doc.setDrawColor(0, 139, 139);
    doc.line(10, y + 21, pageWidth - 10, y + 21);

    y += 27;

    // --- WARNING CENTER HEADER ---
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PORT MORESBY PUBLIC AND SEVERE WEATHER WARNING CENTER.", pageWidth / 2, y, { align: "center" });

    y += 8;
    doc.setFontSize(9.5);
    doc.text("ZCZC GPNG", 10, y);
    doc.text("FF", 10, y + 4);

    const issueDateStr = formatDisplayDate(document.getElementById('issuanceDate').value);
    doc.text(`DATE:   ${issueDateStr}`, pageWidth - 10, y + 4, { align: "right" });

    y += 12;

    // --- RED CENTERED WARNING TITLE ---
    const warningTitleText = "GALE FORCE WIND WARNING:";
    doc.setFontSize(12.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(216, 41, 44); // Red
    doc.text(warningTitleText, pageWidth / 2, y, { align: "center" });
    const textWidth = (doc.getStringUnitWidth(warningTitleText) * 12.5) / doc.internal.scaleFactor;
    doc.setDrawColor(216, 41, 44);
    doc.setLineWidth(0.4);
    doc.line((pageWidth / 2) - (textWidth / 2), y + 1, (pageWidth / 2) + (textWidth / 2), y + 1);

    y += 8;

    // --- ISSUANCE / VALIDITY LINE ---
    const selectedType = document.getElementById('warningType').value;
    const rawValidTime = document.getElementById('validTime').value;
    const validTime12 = formatTime12H(rawValidTime);
    
    const typePrefixText = selectedType === "Renewal" ? "RENEWAL OF" : selectedType.toUpperCase();
    const issuancePrefix = `${typePrefixText} GALE WIND WARNING ISSUED BY PAPUA NEW GUINEA NATIONAL WEATHER SERVICE,`;
    const validPrefix = "VALID FROM ";
    const validSuffix = `, ${issueDateStr}.`;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    const line1 = doc.splitTextToSize(issuancePrefix, pageWidth - 20);
    doc.text(line1, 10, y);
    y += line1.length * 5;

    doc.text(validPrefix, 10, y);
    const validPrefixWidth = (doc.getStringUnitWidth(validPrefix) * 9.5) / doc.internal.scaleFactor;

    doc.setTextColor(216, 41, 44); // Red time
    doc.text(validTime12, 10 + validPrefixWidth, y);
    const timeWidth = (doc.getStringUnitWidth(validTime12) * 9.5) / doc.internal.scaleFactor;

    doc.setTextColor(0, 0, 0);
    doc.text(validSuffix, 10 + validPrefixWidth + timeWidth, y);

    y += 9;

    // --- SYNOPTIC SITUATION HEADING ---
    const rawSynopTime = document.getElementById('synopTime').value;
    const synopDateVal = document.getElementById('synopDate').value;
    const synopTime12 = formatTime12H(rawSynopTime);
    const synopDateFormatted = new Date(synopDateVal + 'T00:00:00').toLocaleDateString('en-GB');
    const utcStamp = document.getElementById('utcTime').value;

    const synopBase = "SYNOPTIC SITUATION AT ";
    const synopRest = `, ${synopDateFormatted} (${utcStamp})`;

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 91, 137); // Blue
    doc.text(synopBase, 10, y);
    const baseW = (doc.getStringUnitWidth(synopBase) * 9.5) / doc.internal.scaleFactor;

    doc.setTextColor(216, 41, 44); // Red time
    doc.text(synopTime12, 10 + baseW, y);
    const timeW = (doc.getStringUnitWidth(synopTime12) * 9.5) / doc.internal.scaleFactor;

    doc.setTextColor(0, 91, 137); // Blue
    doc.text(synopRest, 10 + baseW + timeW, y);

    const fullSynopTitle = synopBase + synopTime12 + synopRest;
    const synopTitleWidth = (doc.getStringUnitWidth(fullSynopTitle) * 9.5) / doc.internal.scaleFactor;
    doc.setDrawColor(0, 91, 137);
    doc.setLineWidth(0.25);
    doc.line(10, y + 1, 10 + synopTitleWidth, y + 1);

    y += 7;

    // Synoptic text body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const synopTextLines = doc.splitTextToSize(document.getElementById('synopText').value, pageWidth - 20);
    doc.text(synopTextLines, 10, y);
    y += (synopTextLines.length * 4.5) + 6;

    // --- WARNING AREAS ---
    doc.setFont("helvetica", "bold");
    doc.text("WARNING AREAS:", 10, y);
    const wAreaWidth = (doc.getStringUnitWidth("WARNING AREAS:") * 9.5) / doc.internal.scaleFactor;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(10, y + 1, 10 + wAreaWidth, y + 1);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.text("WATERS OF:", 10, y);
    y += 5;

    // Bullet items
    const bulletInputs = document.querySelectorAll('.bullet-input');
    bulletInputs.forEach((input) => {
        const val = input.value.trim();
        if (val) {
            const bulletText = `•   ${val.toUpperCase()}`;
            const wrappedBullets = doc.splitTextToSize(bulletText, pageWidth - 25);
            doc.text(wrappedBullets, 10, y);
            y += wrappedBullets.length * 4.8;
        }
    });

    y += 5;

    // --- WARNING NOTE ---
    doc.setFont("helvetica", "bold");
    doc.text("WARNING NOTE:", 10, y);
    const noteWidth = (doc.getStringUnitWidth("WARNING NOTE:") * 9.5) / doc.internal.scaleFactor;
    doc.line(10, y + 1, 10 + noteWidth, y + 1);
    y += 5;

    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(document.getElementById('warningNote').value.toUpperCase(), pageWidth - 20);
    doc.text(noteLines, 10, y);
    y += (noteLines.length * 4.8) + 5;

    // --- CAUTION ---
    doc.setFont("helvetica", "bold");
    doc.text("CAUTION:", 10, y);
    const cautionWidth = (doc.getStringUnitWidth("CAUTION:") * 9.5) / doc.internal.scaleFactor;
    doc.line(10, y + 1, 10 + cautionWidth, y + 1);
    y += 5;

    doc.setFont("helvetica", "normal");
    const cautionLines = doc.splitTextToSize(document.getElementById('cautionText').value.toUpperCase(), pageWidth - 20);
    doc.text(cautionLines, 10, y);
    y += (cautionLines.length * 4.8) + 8;

    // --- NEXT REVIEW LINE ---
    const rawNextReview = document.getElementById('nextReview').value;
    const nextReview12 = formatTime12H(rawNextReview);

    const rawDate = new Date(document.getElementById('issuanceDate').value + 'T00:00:00');
    const dayNum = rawDate.getDate();
    let ordinal = "th";
    if (dayNum === 1 || dayNum === 21 || dayNum === 31) ordinal = "st";
    else if (dayNum === 2 || dayNum === 22) ordinal = "nd";
    else if (dayNum === 3 || dayNum === 23) ordinal = "rd";

    const monthYearStr = rawDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const formattedReviewDate = `${rawDate.toLocaleDateString('en-GB', { weekday: 'long' })}, ${dayNum}${ordinal} ${monthYearStr}.`;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 91, 137);
    doc.text("NEXT REVIEW: ", 10, y);
    const reviewWidth = (doc.getStringUnitWidth("NEXT REVIEW: ") * 9.5) / doc.internal.scaleFactor;

    doc.text(`${nextReview12}, ${formattedReviewDate}`, 10 + reviewWidth, y);
    y += 10;

    // --- FOOTER SIGN-OFF TABLE (Synoptic Time + 10 Minutes & Matching Zulu Stamp) ---
    const [synHour, synMin] = rawSynopTime.split(':').map(Number);
    const [year, month, day] = synopDateVal.split('-');

    // Adjusted to exactly 10 minutes after synoptic time
    let compDateObj = new Date(Date.UTC(year, month - 1, day, synHour, synMin + 10));
    const compHours = String(compDateObj.getUTCHours()).padStart(2, '0');
    const compMinutes = String(compDateObj.getUTCMinutes()).padStart(2, '0');
    const completionTimeString = `${compHours}:${compMinutes}`;
    const formattedCompletionTime12 = formatTime12H(`${compHours}:${compMinutes}`);

    // Matching Zulu timestamp for completion time (+10 mins)
    let zuluBaseDate = new Date(Date.UTC(year, month - 1, day, synHour, synMin + 10));
    zuluBaseDate.setUTCHours(zuluBaseDate.getUTCHours() - 10);
    const zuluDay = String(zuluBaseDate.getUTCDate()).padStart(2, '0');
    const zuluHour = String(zuluBaseDate.getUTCHours()).padStart(2, '0');
    const zuluMin = String(zuluBaseDate.getUTCMinutes()).padStart(2, '0');
    const matchingUtcStamp = `${zuluDay}${zuluHour}${zuluMin}Z`;

    const formattedStampDate = `${String(rawDate.getDate()).padStart(2, '0')}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${rawDate.getFullYear()}`;
    const fullTimeStamp = `${formattedStampDate}, ${formattedCompletionTime12} (${matchingUtcStamp})`;

    const authorizerName = document.getElementById('authorizers').value.toUpperCase();

    doc.setDrawColor(0, 91, 137);
    doc.setLineWidth(0.3);
    doc.rect(10, y, pageWidth - 20, 8);
    doc.line(100, y, 100, y + 8);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("TIME & DATE:", 12, y + 5.2);

    doc.setFont("helvetica", "normal");
    doc.text(fullTimeStamp, 35, y + 5.2);

    doc.setFont("helvetica", "bold");
    doc.text("AUTHORISED BY:", 102, y + 5.2);

    doc.setFont("helvetica", "normal");
    doc.text(authorizerName, 132, y + 5.2);

    y += 15;

    doc.setFont("helvetica", "normal");
    doc.text("NNNN", 10, y);

    // --- DYNAMIC FILE NAMING ---
    const cleanValidTime = rawValidTime.replace(':', ''); // e.g. "1700"
    const rawIssueParts = document.getElementById('issuanceDate').value.split('-'); // [yyyy, mm, dd]
    const dateFormattedTag = `${rawIssueParts[2]}-${rawIssueParts[1]}-${rawIssueParts[0]}`; // dd-mm-yyyy

    const fileName = `GALE WIND WARNING (${selectedType})_${cleanValidTime}_${dateFormattedTag}.pdf`;
    doc.save(fileName);
}

// --- LOCAL STORAGE PERSISTENCE ---
function saveData() {
    const data = {
        warningType: document.getElementById('warningType').value,
        issuanceDate: document.getElementById('issuanceDate').value,
        validTime: document.getElementById('validTime').value,
        synopTime: document.getElementById('synopTime').value,
        synopDate: document.getElementById('synopDate').value,
        synopText: document.getElementById('synopText').value,
        warningNote: document.getElementById('warningNote').value,
        cautionText: document.getElementById('cautionText').value,
        nextReview: document.getElementById('nextReview').value,
        authorizers: document.getElementById('authorizers').value,
        bullets: Array.from(document.querySelectorAll('.bullet-input')).map(i => i.value)
    };
    localStorage.setItem('pngnws_galewind_data', JSON.stringify(data));
    alert("✅ Data saved successfully!");
}

function loadData() {
    const saved = localStorage.getItem('pngnws_galewind_data');
    if (!saved) return;
    const data = JSON.parse(saved);

    if (data.warningType) document.getElementById('warningType').value = data.warningType;
    if (data.issuanceDate) document.getElementById('issuanceDate').value = data.issuanceDate;
    if (data.validTime) document.getElementById('validTime').value = data.validTime;
    if (data.synopTime) document.getElementById('synopTime').value = data.synopTime;
    if (data.synopDate) document.getElementById('synopDate').value = data.synopDate;
    if (data.synopText) document.getElementById('synopText').value = data.synopText;
    if (data.warningNote) document.getElementById('warningNote').value = data.warningNote;
    if (data.cautionText) document.getElementById('cautionText').value = data.cautionText;
    if (data.nextReview) document.getElementById('nextReview').value = data.nextReview;
    if (data.authorizers) document.getElementById('authorizers').value = data.authorizers;

    if (data.bullets && data.bullets.length > 0) {
        const container = document.getElementById('bulletContainer');
        container.innerHTML = '';
        data.bullets.forEach(b => addBulletField(b));
    }
    updateUTC();
}

function resetData() {
    if (confirm("⚠️ Clear current inputs and restore defaults?")) {
        localStorage.removeItem('pngnws_galewind_data');
        location.reload();
    }
}