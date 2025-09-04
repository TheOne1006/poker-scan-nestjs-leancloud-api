import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { config } from '../../../config';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class RSAService {
  private publicKey: string;
  private privateKey: string;
  private passphrase: string;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { 

    // 判断 config.rsa.publicKeyFile 和 config.rsa.privateKeyFile 是否存在
    if (!fs.existsSync(config.rsa.publicKeyFile) || !fs.existsSync(config.rsa.privateKeyFile)) {
      throw new Error('RSA private key file not found. Please set RSA_PRIVATE_KEY_FILE environment variable.');
    }
    this.publicKey = fs.readFileSync(config.rsa.publicKeyFile, 'utf8');
    this.privateKey = fs.readFileSync(config.rsa.privateKeyFile, 'utf8');
    this.passphrase = config.rsa.passphrase;
    if (!this.publicKey || !this.privateKey) {
        throw new Error('RSA keys not configured. Please set RSA_PUBLIC_KEY_FILE and RSA_PRIVATE_KEY_FILE environment variables.');
    }
  }

  encrypt(data: string): string {
    try {
      const encrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data, 'utf8')
      );
      return encrypted.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
          passphrase: this.passphrase,
        },
        Buffer.from(encryptedData, 'base64')
      );
      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }


  checkDataWithRSA(data: { [key: string]: any }, rsaData: string): boolean {
    const jsonData = JSON.stringify(data);
    try {
      const decrypted = this.decrypt(rsaData);
      return decrypted === jsonData;
    } catch (error) {
      return false;
    }
  }
}






