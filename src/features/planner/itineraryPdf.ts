import type { Trip } from './model';
import { displayDate, shiftDay, timeRange } from './logic';
import { photoData } from './photoData';
export type PdfOptions = { includeTravelers: boolean; includeNotes: boolean; includeCover: boolean };
export const defaultPdfOptions: PdfOptions = { includeTravelers: false, includeNotes: false, includeCover: true };
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
export function itineraryHtml(trip: Trip, options: PdfOptions = defaultPdfOptions): string {
  const e = escapeHtml;
  const count = Math.round((Date.parse(trip.endDate)-Date.parse(trip.startDate))/86400000)+1;
  if (!Number.isFinite(count) || count < 1 || count > 366) throw Error('PDF export supports trips up to 366 days.');
  const cover = options.includeCover ? photoData(trip.coverPhoto) : undefined;
  const days = Array.from({length:count}, (_,i) => {
    const date = shiftDay(trip.startDate,i);
    const activities = trip.activities.filter(a=>a.date===date).sort((a,b)=>a.time.localeCompare(b.time));
    return `<section><h2><span>DAY ${i+1}</span> ${e(displayDate(date))}</h2>${activities.length ? activities.map(a=>`<article><p class="time">${e(timeRange(a))}</p><h3>${e(a.title)}</h3>${a.location?`<p class="location">${e(a.location)}</p>`:''}${options.includeNotes&&a.notes?`<p class="notes">${e(a.notes)}</p>`:''}</article>`).join(''):'<p class="empty">Free time - no activities planned.</p>'}</section>`;
  }).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(trip.name)} - Itinerary</title>
<style>
@page { size:A4; margin:18mm 16mm; }
*{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#173235;font-size:11pt;line-height:1.5;margin:0;overflow-wrap:anywhere}
header{border-top:7px solid #19bfc2;padding-top:18px;margin-bottom:26px} .eyebrow{color:#147b7d;letter-spacing:2px;font-size:9pt;font-weight:bold;margin:0 0 8px}
h1{font-size:28pt;line-height:1.15;margin:0 0 12px} .destination{font-size:14pt;margin:0 0 4px} .meta{color:#5c7175;margin:4px 0}
.cover{width:100%;height:170px;object-fit:cover;border-radius:10px;margin:12px 0} .travelers{padding:10px 14px;background:#edf8f7;border-radius:6px;margin-top:14px}
section{margin:0 0 24px} h2{font-size:14pt;border-bottom:1px solid #b9dedd;padding:0 0 8px;margin:0 0 14px;break-after:avoid} h2 span{font-size:9pt;color:#147b7d;margin-right:12px}
article{border-left:3px solid #19bfc2;padding:0 0 0 14px;margin:0 0 18px;break-inside:auto} .time{color:#147b7d;font-weight:bold;font-size:10pt;margin:0 0 3px;break-after:avoid} h3{font-size:12pt;margin:0 0 4px;break-after:avoid} .location{margin:0;color:#5c7175} .notes{white-space:pre-wrap;margin:8px 0 0;orphans:3;widows:3} .empty{color:#65787b;font-style:italic}
footer{border-top:1px solid #dce8e7;padding-top:12px;margin-top:28px;font-size:9pt;color:#65787b;break-inside:avoid}
.screen-controls{display:block;background:#edf8f7;padding:16px;margin-bottom:20px;border-radius:8px}.screen-controls button{padding:10px 16px;cursor:pointer} @media print{.screen-controls{display:none} body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<header><p class="eyebrow">YOUR TRAVEL PLAN</p><h1>${e(trip.name)}</h1><p class="destination">${e(trip.city)}, ${e(trip.country)}</p><p class="meta">${e(displayDate(trip.startDate))} - ${e(displayDate(trip.endDate))} · ${e(trip.pace)} pace</p>${cover?`<img class="cover" src="${cover}" alt="Trip cover">`:''}${options.includeTravelers?`<p class="travelers"><strong>Travelers:</strong> ${e(trip.travelers.join(', '))}</p>`:''}</header>
${days}<footer>Times are local to the destination. This is a snapshot of the plan; later edits do not update this PDF.<br>Booking references, expenses and preparation tasks are not included.</footer></body></html>`;
}
