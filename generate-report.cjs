// generate-report.cjs — generates client-facing PDF report
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'Danilets_Update_Report.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 60, right: 60 },
  info: {
    Title: 'Website Update Report — Danilets',
    Author: 'Danilets Development Team',
  },
});

doc.pipe(fs.createWriteStream(OUTPUT));

// ─── Colors ───────────────────────────────────────────────────────────────────
const GOLD   = '#A8834E';
const DARK   = '#111827';
const GRAY   = '#6B7280';
const LIGHT  = '#F9F9FB';
const WHITE  = '#FFFFFF';
const LINE   = '#E5E7EB';

const PAGE_W = doc.page.width  - 120; // usable width

// ─── Helpers ──────────────────────────────────────────────────────────────────
function drawRect(x, y, w, h, color, radius = 0) {
  doc.roundedRect(x, y, w, h, radius).fill(color);
}

function sectionTitle(text, y) {
  doc.y = y;
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(DARK)
    .text(text, 60, y);
  doc
    .moveTo(60, doc.y + 4)
    .lineTo(60 + PAGE_W, doc.y + 4)
    .lineWidth(1)
    .strokeColor(LINE)
    .stroke();
  doc.moveDown(0.5);
}

function item(icon, title, body) {
  const startY = doc.y;
  // icon circle
  doc
    .circle(75, startY + 9, 8)
    .fill(GOLD);
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(WHITE)
    .text(icon, 70, startY + 4, { width: 12, align: 'center' });

  // title
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(DARK)
    .text(title, 92, startY, { width: PAGE_W - 32 });

  // body
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(GRAY)
    .text(body, 92, doc.y + 2, { width: PAGE_W - 32, lineGap: 2 });

  doc.moveDown(0.9);
}

// ─── COVER ────────────────────────────────────────────────────────────────────
drawRect(0, 0, doc.page.width, 220, DARK);

doc
  .font('Helvetica-Bold')
  .fontSize(28)
  .fillColor(GOLD)
  .text('DANILETS', 60, 55, { align: 'center' });

doc
  .font('Helvetica')
  .fontSize(13)
  .fillColor(WHITE)
  .text('Auto Detailing & Commercial Cleaning', 60, 90, { align: 'center' });

drawRect(60, 118, PAGE_W, 1.5, GOLD);

doc
  .font('Helvetica-Bold')
  .fontSize(19)
  .fillColor(WHITE)
  .text('Website Updates Report', 60, 130, { align: 'center' });

doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor('#9CA3AF')
  .text('June 2026', 60, 158, { align: 'center' });

doc.y = 250;

// ─── INTRO ────────────────────────────────────────────────────────────────────
doc
  .font('Helvetica')
  .fontSize(11)
  .fillColor(GRAY)
  .text(
    'Dear Danilets team,\n\nWe are pleased to share the results of the latest round of improvements made to your website. Below you will find a clear description of every update — what was changed, why it was done, and what benefit it brings to you and your customers.',
    60, doc.y, { width: PAGE_W, lineGap: 3 }
  );

doc.moveDown(1.5);

// ─── SECTION 1 ────────────────────────────────────────────────────────────────
sectionTitle('1.  Navigation — "Learn More" Buttons Now Work Correctly', doc.y);

item(
  '✓',
  'Fixed broken navigation links',
  'When a visitor clicked "Learn More" on the Detailing or Cleaning service card on the home page, they were sent back to the home page instead of the correct service page. This has been fixed — clicking "Learn More" on Detailing now opens the full Detailing page, and clicking "Learn More" on Cleaning opens the full Cleaning page.'
);

doc.moveDown(0.5);

// ─── SECTION 2 ────────────────────────────────────────────────────────────────
sectionTitle('2.  Special Offers Management in the Admin Panel', doc.y);

item(
  '★',
  'New "Special Offers" section in the CRM',
  'A brand-new section has been added to the admin panel where you can create, edit, and remove promotional offers. Each offer can include a title, a short description, a discount percentage, an expiry date, and an optional photo.'
);

item(
  '★',
  'Live offers displayed on the website automatically',
  'Once you publish an offer in the admin panel, it appears immediately on the website banner (the dark strip at the bottom of the main page). If you have multiple active offers, the banner will cycle through them automatically. When an offer expires or is deleted, the banner reverts to "Deals Coming Soon" on its own — no manual work needed.'
);

doc.moveDown(0.5);

// ─── SECTION 3 ────────────────────────────────────────────────────────────────
sectionTitle('3.  Website Layout — Equal Spacing on All Pages', doc.y);

item(
  '⊞',
  'Consistent padding and margins across the entire site',
  'Several pages — including the Detailing page and the About Us page — had sections that stretched all the way to the edges of the screen with no breathing room. This has been corrected. Now every section on every page has the same balanced left and right spacing, giving the website a clean, professional look on all screen sizes.'
);

doc.moveDown(0.5);

// ─── SECTION 4 ────────────────────────────────────────────────────────────────
sectionTitle('4.  Vehicle Information in Your Account', doc.y);

item(
  '🚗',
  'Personal and Commercial vehicles stored separately',
  'The "Vehicle Information" section in the customer account has been completely rebuilt. Vehicles are now divided into two clear categories — Personal and Commercial — so customers can keep their personal car and work vehicle information neatly separated.'
);

item(
  '🚗',
  'Add as many vehicles as needed',
  'Previously only one vehicle could be saved. Now customers can add any number of vehicles in each category, and can remove vehicles they no longer use.'
);

item(
  '🚗',
  'Upload a photo for each vehicle',
  'Each saved vehicle now has an optional photo upload. Customers can attach a picture of their car or truck, making it easy to identify the right vehicle at a glance.'
);

item(
  '🚗',
  'Auto-fill vehicle details when booking a service',
  'When a customer starts a new service request, a "Use a saved vehicle" option now appears at the top of the vehicle information step. They can select any of their saved vehicles and all the details (year, make, model, color) are filled in automatically — no need to retype information every time.'
);

doc.moveDown(0.5);
doc.addPage();

// ─── SECTION 5 ────────────────────────────────────────────────────────────────
sectionTitle('5.  Address Fields in Personal Profile', doc.y);

item(
  '📍',
  'Customers can now save their address',
  'The personal profile page previously had no address field. Now customers can save a Personal Address, a Commercial / Business Address, or both — selected with a simple toggle button. This information is stored securely in their account for future use.'
);

doc.moveDown(0.5);

// ─── SECTION 6 ────────────────────────────────────────────────────────────────
sectionTitle('6.  Past Orders — Fully Readable Information', doc.y);

item(
  '📋',
  'All order details now shown in plain English',
  'When a customer opened a past order, some fields were showing internal system codes instead of understandable text — for example "post_construction", "property_mgmt", or "3000_5000". Every field has now been converted to clear, friendly language — for example "Post-Construction Clean", "Property Management", or "$3,000 – $5,000". Customers can now read and understand all their order details without confusion.'
);

doc.moveDown(1.5);

// ─── SUMMARY TABLE ────────────────────────────────────────────────────────────
sectionTitle('Summary of All Improvements', doc.y);
doc.moveDown(0.3);

const tableTop   = doc.y;
const colW       = [30, PAGE_W - 30];
const rowH       = 28;
const rows = [
  ['#',  'What Was Done'],
  ['1',  'Fixed "Learn More" buttons — now lead to the correct Detailing and Cleaning pages'],
  ['2',  'New Special Offers section in admin panel + live offer banner on website'],
  ['3',  'Uniform spacing and padding fixed on all pages'],
  ['4',  'Vehicle accounts: Personal/Commercial split, multiple vehicles, photo upload, auto-fill in booking'],
  ['5',  'Personal and Commercial address fields added to customer profile'],
  ['6',  'All order details now displayed in plain, customer-friendly English'],
];

rows.forEach((row, i) => {
  const y = tableTop + i * rowH;
  const isHeader = i === 0;
  drawRect(60, y, PAGE_W, rowH, isHeader ? DARK : (i % 2 === 0 ? LIGHT : WHITE));

  doc
    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(isHeader ? 10 : 9.5)
    .fillColor(isHeader ? WHITE : DARK)
    .text(row[0], 68, y + 8, { width: colW[0] - 4 });

  doc
    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(isHeader ? 10 : 9.5)
    .fillColor(isHeader ? WHITE : DARK)
    .text(row[1], 68 + colW[0], y + 8, { width: colW[1] - 8 });
});

doc.y = tableTop + rows.length * rowH + 20;

// ─── FOOTER NOTE ──────────────────────────────────────────────────────────────
doc.moveDown(1);
drawRect(60, doc.y, PAGE_W, 54, '#FFF7E6', 10);

doc
  .font('Helvetica-Bold')
  .fontSize(10)
  .fillColor(GOLD)
  .text('All changes are live and have been successfully deployed.', 75, doc.y + 10, { width: PAGE_W - 30 });

doc
  .font('Helvetica')
  .fontSize(9.5)
  .fillColor(GRAY)
  .text('If you have any questions about any of the updates described above, please reach out and we will be happy to assist.', 75, doc.y + 4, { width: PAGE_W - 30 });

// ─── PAGE FOOTER ──────────────────────────────────────────────────────────────
const bottomY = doc.page.height - 45;
doc
  .moveTo(60, bottomY)
  .lineTo(60 + PAGE_W, bottomY)
  .lineWidth(0.5)
  .strokeColor(LINE)
  .stroke();

doc
  .font('Helvetica')
  .fontSize(8.5)
  .fillColor('#9CA3AF')
  .text('Danilets Auto Detailing & Commercial Cleaning — Columbus, OH', 60, bottomY + 8, { align: 'center', width: PAGE_W });

doc.end();
console.log('PDF created:', OUTPUT);
