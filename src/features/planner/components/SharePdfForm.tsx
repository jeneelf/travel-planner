import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { Trip } from '../model';
import { defaultPdfOptions } from '../itineraryPdf';
import { shareItineraryPdf } from '../sharePdf';
import { FormPage, Notice, s } from '../ui';
export function SharePdfForm({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const [options, setOptions] = useState(defaultPdfOptions);
  const choices = [ ['includeCover','Include my trip cover'], ['includeTravelers','Include traveler names'], ['includeNotes','Include activity notes'] ] as const;
  return <FormPage title="Share Itinerary as PDF" label={Platform.OS==='web'?'Open PDF Print View':'Create & Share PDF'} onClose={onClose} onSave={()=>shareItineraryPdf(trip,options)}>
    <Text style={[s.h3,{marginBottom:16}]}>{trip.name}</Text>
    <Notice text="The PDF includes your destination, dates, daily activities, times and locations. Booking references, expenses and checklists stay private."/>
    <View style={{marginBottom:18}}>{choices.map(([key,label])=><Pressable key={key} accessibilityRole="checkbox" accessibilityState={{checked:options[key]}} onPress={()=>setOptions({...options,[key]:!options[key]})} style={{paddingVertical:14}}><Text style={s.body}>{options[key]?'☑':'□'} {label}</Text></Pressable>)}</View>
    <Notice text={Platform.OS==='web'?'Your browser opens a print-ready version. Choose Save as PDF, then send the saved file.':'Your phone opens its share sheet with a PDF attachment. Choose a recipient or Save to Files.'}/>
    <Text style={[s.tiny,{marginBottom:20}]}>A shared PDF is a snapshot. It does not invite anyone or provide editing access.</Text>
  </FormPage>;
}
