import type { Trip } from './model';
import { itineraryHtml, type PdfOptions } from './itineraryPdf';

export async function shareItineraryPdf(
  trip: Trip,
  options: PdfOptions
): Promise<void> {
  const controls = `<div class="screen-controls">
    <p>Your itinerary is ready. Click Print / Save as PDF,
    then choose Save as PDF.</p>
    <button onclick="window.print()">Print / Save as PDF</button>
    <button onclick="window.close()">Close preview</button>
    <p>If the buttons are unavailable, use your browser's Print
    command (Command+P on Mac). Close this tab to return to your trip.</p>
  </div>`;

  const html = itineraryHtml(trip, options)
    .replace('<body>', '<body>' + controls);

  const url = URL.createObjectURL(
    new Blob([html], { type: 'text/html;charset=utf-8' })
  );

  const preview = window.open(url, '_blank');

  if (!preview) {
    URL.revokeObjectURL(url);
    throw Error('Allow pop-ups for this site, then try again.');
  }

  preview.opener = null;

  // Release the app immediately; printing happens in the new tab.
  window.setTimeout(() => URL.revokeObjectURL(url), 300000);
}
