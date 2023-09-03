using Microsoft.AspNetCore.Mvc;
using ChatApp.Services;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cors;

public class EncryptionRequest
{
    public string? PlainText { get; set; }
    public string? PublicKey { get; set; }
}

public class DecryptionRequest
{
    public string? CipherText { get; set; }
    public string? EncryptedSymmetricKey { get; set; } 
    public string? PrivateKey { get; set; }
}

[ApiController]
[Route("[controller]")]
[EnableCors("AllowAllOrigins")]
public class EncryptionController : ControllerBase
{
    private readonly EncryptionService _encryptionService;
    private string _encryptionKey;

    public EncryptionController()
    {
        _encryptionKey = EncryptionService.GenerateRandomKey();
        Console.WriteLine($"Generated Key: {_encryptionKey}");
        _encryptionService = new EncryptionService(_encryptionKey);
    }

    [HttpGet("rsa-keys")]
    public IActionResult GenerateKeys()
    {
        var (publicKey, privateKey) = EncryptionService.GenerateRSAKeyPair();
        return Ok(new { PublicKey = publicKey, PrivateKey = privateKey });
    }

    [HttpPost("encrypt")]
    public ActionResult<string> Encrypt([FromBody] EncryptionRequest request)
    {
        Console.WriteLine($"Received PlainText: {request.PlainText}");
        Console.WriteLine($"Received PublicKey: {request.PublicKey}");

        if (request.PlainText == null || request.PublicKey == null)
            return BadRequest("Missing required parameters.");

        try
        {
            string sessionKey = EncryptionService.GenerateRandomKey();
            Console.WriteLine($"Generated Session Key: {sessionKey}");

            EncryptionService sessionEncryptionService = new EncryptionService(sessionKey);

            string encryptedText = sessionEncryptionService.EncryptString(request.PlainText);
            Console.WriteLine($"Encrypted Text: {encryptedText}");

            string encryptedSymmetricKey = EncryptWithPublicKey(sessionKey, request.PublicKey);
            Console.WriteLine($"Encrypted Symmetric Key: {encryptedSymmetricKey?.Substring(0, 10)}");

            return Ok(new { EncryptedText = encryptedText, EncryptedSymmetricKey = encryptedSymmetricKey });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception: {ex}");
            return BadRequest($"Error encrypting: {ex.Message}");
        }
    }

    [HttpPost("decrypt")]
    public ActionResult<string> Decrypt([FromBody] DecryptionRequest request)
    {
        Console.WriteLine($"Received CipherText: {request.CipherText}");
        Console.WriteLine($"Received EncryptedSymmetricKey: {request.EncryptedSymmetricKey}");
        Console.WriteLine($"Received PrivateKey: {request.PrivateKey?.Substring(0, 10)}...");

        if (request.CipherText == null || request.EncryptedSymmetricKey == null || request.PrivateKey == null)
            return BadRequest("Missing required parameters.");

        try
        {
            string decryptedSymmetricKey = DecryptWithPrivateKey(request.EncryptedSymmetricKey, request.PrivateKey);
            
            Console.WriteLine($"Decrypted Symmetric Key: {decryptedSymmetricKey}");

            EncryptionService sessionEncryptionService = new EncryptionService(decryptedSymmetricKey);

            string decryptedText = sessionEncryptionService.DecryptString(request.CipherText);
            
            Console.WriteLine($"Decrypted Text: {decryptedText}");

            return Ok(decryptedText);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error decrypting: {ex}");
            return BadRequest($"Error decrypting: {ex.Message}");
        }
    }

    public static string EncryptWithPublicKey(string dataToEncrypt, string publicKey)
    {
        byte[] dataToEncryptBytes = Encoding.UTF8.GetBytes(dataToEncrypt);
        using (RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048))
        {
            rsa.FromXmlString(publicKey);
            byte[] encryptedData = rsa.Encrypt(dataToEncryptBytes, true);
            return Convert.ToBase64String(encryptedData);
        }
    }

    public static string DecryptWithPrivateKey(string dataToDecrypt, string privateKey)
    {
        byte[] dataToDecryptBytes = Convert.FromBase64String(dataToDecrypt);
        using (RSACryptoServiceProvider rsa = new RSACryptoServiceProvider(2048))
        {
            rsa.FromXmlString(privateKey);
            byte[] decryptedData = rsa.Decrypt(dataToDecryptBytes, true);
            return Encoding.UTF8.GetString(decryptedData);
        }
    }
}