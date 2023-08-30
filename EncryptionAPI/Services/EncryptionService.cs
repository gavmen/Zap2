using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace ChatApp.Services
{
    public class EncryptionService
    {
        private readonly string _key;

        public EncryptionService(string key)
        {
            _key = key;
        }

        private byte[] GetKeyBytes()
        {
            return Convert.FromBase64String(_key);
        }

        public string EncryptString(string plainText)
        {
            using (Aes aes = Aes.Create())
            {
                aes.Key = GetKeyBytes();
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
                aes.Key = GetKeyBytes();
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

