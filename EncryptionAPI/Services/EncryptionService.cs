using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace ChatApp.Services
{
    public class EncryptionService
    {
        private readonly byte[] _keyBytes;

        public EncryptionService(string base64Key)
        {
            if (string.IsNullOrEmpty(base64Key))
            {
                throw new ArgumentException("Key cannot be null or empty");
            }

            _keyBytes = Convert.FromBase64String(base64Key);

            if (_keyBytes.Length != 32)
            {
                throw new ArgumentException("Key must be a Base-64 encoded string of 32 bytes (256 bits)");
            }
        }

        public static string GenerateBase64Key()
        {
            using (Aes aes = Aes.Create())
            {
                aes.KeySize = 256; // AES-256
                aes.GenerateKey();
                return Convert.ToBase64String(aes.Key);
            }
        }

        public string EncryptString(string plainText)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = _keyBytes;
                aes.IV = new byte[16]; // Initialization vector with 16 zeros

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter streamWriter = new StreamWriter(cryptoStream))
                        {
                            streamWriter.Write(plainText);
                        }
                        return Convert.ToBase64String(memoryStream.ToArray());
                    }
                }
            }
        }

        public string DecryptString(string cipherText)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = _keyBytes;
                aes.IV = new byte[16]; // Initialization vector with 16 zeros

                ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream(Convert.FromBase64String(cipherText)))
                {
                    using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader streamReader = new StreamReader(cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
        }
    }
}
