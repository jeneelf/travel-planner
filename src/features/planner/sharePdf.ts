import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Trip } from './model';
import { itineraryHtml, type PdfOptions } from './itineraryPdf';
export async function shareItineraryPdf(trip: Trip, options: PdfOptions): Promise<void> {
  if (!await Sharing.isAvailableAsync()) throw Error('File sharing is unavailable on this device. Try exporting in the browser.');
  const { uri } = await Print.printToFileAsync({ html: itineraryHtml(trip, options) });
  await Sharing.shareAsync(uri, { mimeType:'application/pdf', UTI:'com.adobe.pdf', dialogTitle:`Share ${trip.name}` });
}
