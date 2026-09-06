import jsPDF from 'jspdf';
import type { DailyCsiScore, PatientProfile, TelemetryRecord } from '../types';

export function generateClinicalPdfReport(
  profile: PatientProfile,
  past7Days: DailyCsiScore[],
  telemetry: TelemetryRecord[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(37, 99, 235); // Royal Indigo / Blue (#2563eb)
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('BRAINACTIVER - COGNITIVE HEALTH & WELLNESS REPORT', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Autonomous On-Device AI Cognitive Training & Clinical Stability Index (CSI)', 14, 18);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 45, 18);

  y = 36;
  doc.setTextColor(30, 41, 59);

  // Patient Demographic Card
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('PATIENT DEMOGRAPHICS & CLINICAL STAGE', 18, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient Name: ${profile.name}`, 18, y + 16);
  doc.text(`Age: ${profile.age} Years`, 18, y + 23);
  doc.text(`Location: ${profile.location}`, 18, y + 30);

  doc.text(`Clinical Diagnosis: ${profile.dementiaStage}`, 110, y + 16);
  doc.text(`Care Supervisor: ${profile.ashaWorkerName}`, 110, y + 23);
  doc.text(`Caregiver Contact: ${profile.caregiverContact}`, 110, y + 30);

  y += 46;

  // CSI Metrics
  const todayCsi = past7Days[past7Days.length - 1];
  const avgCsi = Math.round(past7Days.reduce((a, b) => a + b.compositeCsi, 0) / past7Days.length);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('COGNITIVE STABILITY INDEX (CSI) - 7 DAY TRAJECTORY', 14, y);

  y += 6;

  const colWidth = (pageWidth - 28 - 9) / 4;
  const domains = [
    { label: 'Composite CSI', val: `${todayCsi.compositeCsi}/100`, status: 'Stable' },
    { label: 'Memory Recall', val: `${todayCsi.memoryScore}%`, status: 'Working & Photo' },
    { label: 'Executive Logic', val: `${todayCsi.executiveScore}%`, status: 'Routines & Math' },
    { label: 'Attention & Motor', val: `${todayCsi.motorStabilityScore}%`, status: 'Rhythm Jitter' },
  ];

  domains.forEach((item, idx) => {
    const x = 14 + (idx * (colWidth + 3));
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, x + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(item.val, x + 4, y + 14);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105);
    doc.text(item.status, x + 4, y + 19);
  });

  y += 30;

  // Trend Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Daily Cognitive Session Matrix', 14, y);

  y += 5;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Date', 18, y + 5.5);
  doc.text('Composite CSI', 48, y + 5.5);
  doc.text('Memory (%)', 85, y + 5.5);
  doc.text('Executive (%)', 120, y + 5.5);
  doc.text('Attention (%)', 155, y + 5.5);

  y += 8;
  past7Days.forEach((day, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(day.date, 18, y + 5);
    doc.text(`${day.compositeCsi} / 100`, 48, y + 5);
    doc.text(`${day.memoryScore}%`, 85, y + 5);
    doc.text(`${day.executiveScore}%`, 120, y + 5);
    doc.text(`${day.attentionScore}%`, 155, y + 5);
    y += 7;
  });

  y += 8;

  // Clinical Observation
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text('BRAINACTIVER CLINICAL OBSERVATION & TELEMETRY NOTES', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 50, 20);
  doc.text(
    `• Baseline decision latency: ~${profile.baselineLatencyMs}ms with stable motor velocity.`,
    18,
    y + 14
  );
  doc.text(
    `• Overall 7-Day Average Stability Index: ${avgCsi}/100. ${todayCsi.clinicalNote}`,
    18,
    y + 20
  );
  doc.text(
    `• Recorded cognitive sessions across 6 games: ${telemetry.length} total sessions.`,
    18,
    y + 25
  );

  y += 38;

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.line(18, y + 10, 75, y + 10);
  doc.text('Signature of Care / ASHA Lead', 18, y + 15);
  doc.text(`(${profile.ashaWorkerName})`, 18, y + 19);

  doc.line(pageWidth - 75, y + 10, pageWidth - 18, y + 10);
  doc.text('Physician / Health Officer In-Charge', pageWidth - 75, y + 15);
  doc.text('Clinical Cognitive Wellness Block', pageWidth - 75, y + 19);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Generated 100% locally on-device by Brainactiver (Modern AI Cognitive Training & Wellness Platform)',
    14,
    doc.internal.pageSize.getHeight() - 8
  );

  doc.save(`Brainactiver_Clinical_Report_${profile.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
