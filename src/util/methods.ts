import bcrypt from 'bcrypt';
import NodeGeocoder from 'node-geocoder';
import { API_KEY } from './constants';
export function isRequestValid(requestObject: Object): boolean {
    const requestPropertiesTypes = Object.values(requestObject).map(
      (v) => typeof v
    );
  
    return !requestPropertiesTypes.includes("undefined");
  }
  export async function encryptPassword(
    plainTextPassword: string
  ): Promise<string> {
    const salt = await bcrypt.genSalt(10);
  
    return bcrypt.hash(plainTextPassword, salt);
  }
  
  export async function decryptPassword(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
  const options: NodeGeocoder.Options = {
    provider: 'google',
    apiKey: API_KEY, 
    formatter: null, 
  };
  
  const geocoder = NodeGeocoder(options);
  
  export async function reverseGeocoding(latitude: number, longitude: number): Promise<string> {
    try {
      const res = await geocoder.reverse({ lat: latitude, lon: longitude });
      if (res.length > 0 && res[0].formattedAddress) {
        return res[0].formattedAddress;
      } else {
        console.error('No results or formatted address not found');
        return '';
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return '';
    }
  }