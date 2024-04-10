import bcrypt from 'bcrypt';
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