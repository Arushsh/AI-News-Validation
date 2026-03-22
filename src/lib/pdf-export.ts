// src/lib/pdf-export.ts
// Feature D – Download as PDF using jsPDF + html2canvas

export async function downloadVerificationPDF(data: any) {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(17, 24, 39); // neutral-900
  doc.rect(0, 0, w, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('VerifyLens — Verification Report', 14, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // Score Section
  const authScore = data.authenticity_score ?? data.authenticity ?? 50;
  const aiProb = data.ai_generated_probability ?? (100 - authScore);
  const verdict = authScore >= 75 ? 'LIKELY AUTHENTIC' : authScore >= 45 ? 'INCONCLUSIVE' : 'LIKELY FALSE';
  const scoreColor: [number, number, number] = authScore >= 75 ? [52, 211, 153] : authScore >= 45 ? [251, 191, 36] : [248, 113, 113];

  doc.setFillColor(23, 23, 23);
  doc.rect(0, 44, w, 48, 'F');

  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`${authScore}%`, 28, 74);

  doc.setFontSize(11);
  doc.text(verdict, 28, 84);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`AI-Generated Probability: ${aiProb}%`, 100, 68);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Powered by Groq Llama 3 + Google Fact Check + Tavily Search', 100, 78);

  // Explanation
  doc.setFillColor(10, 10, 10);
  doc.rect(14, 100, w - 28, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 180, 180);
  doc.text('AI EXPLANATION', 14, 112);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 220, 220);
  const explanation = data.explanation ?? 'No explanation available.';
  const lines = doc.splitTextToSize(explanation, w - 28);
  doc.text(lines, 14, 122);

  // Sources
  const sources = data.sources_analyzed ?? data.sources ?? [];
  if (sources.length > 0) {
    let y = 126 + lines.length * 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('SOURCES ANALYZED', 14, y + 12);
    y += 20;

    sources.forEach((src: any) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(`• ${src.name || src.publisher}`, 14, y);
      if (src.url) {
        doc.setTextColor(99, 133, 255);
        doc.text(src.url, 20, y + 5);
      }
      y += 12;
    });
  }

  // Footer
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 275, w, 22, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('VerifyLens · AI News Verification Platform · verifylens.app', 14, 285);

  doc.save(`VerifyLens-Report-${Date.now()}.pdf`);
}
