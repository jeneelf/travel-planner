import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { MAX_PHOTO_CHARS, photoData } from './photoData';
export async function choosePhoto(kind: 'profile' | 'cover'): Promise<string | null> {
  // Keep the web picker directly connected to the user's click.
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw Error('Allow photo access in your device settings to choose a photo.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], allowsMultipleSelection: false, allowsEditing: false,
    quality: 1, exif: false,
  });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (kind === 'profile' && asset.width > 0 && asset.height > 0) {
    const side = Math.min(asset.width, asset.height);
    context.crop({ originX: Math.floor((asset.width-side)/2), originY: Math.floor((asset.height-side)/2), width: side, height: side });
    context.resize({ width: 256 });
  } else {
    // Limit both dimensions for portrait photos too.
    const max = 960;
    context.resize(asset.height > asset.width ? { height: max } : { width: max });
  }
  const image = await context.renderAsync();
  let saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.65, base64: true });
  if (!saved.base64) throw Error('This photo could not be processed. Try a JPG or PNG.');
  let uri = `data:image/jpeg;base64,${saved.base64}`;
  if (uri.length > MAX_PHOTO_CHARS) {
    saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.35, base64: true });
    uri = `data:image/jpeg;base64,${saved.base64 ?? ''}`;
  }
  if (uri.length > MAX_PHOTO_CHARS) throw Error('This image is still too large. Choose a smaller photo.');
  return photoData(uri) ?? null;
}
