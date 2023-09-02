using Microsoft.AspNetCore.Mvc;
using ChatApp.Services;
using System;

public class EncryptionRequest
{
    public string? PlainText { get; set; }
    public string? EncryptedSymmetricKey { get; set; }
}

public class DecryptionRequest
{
    public string? CipherText { get; set; }
    public string? PrivateKey { get; set; }
}

[ApiController]
[Route("[controller]")]
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

    [HttpGet("generate-keys")]
    public IActionResult GenerateKeys()
    {
        var (publicKey, privateKey) = EncryptionService.GenerateRSAKeyPair();
        return Ok(new { PublicKey = publicKey, PrivateKey = privateKey });
    }

    [HttpPost("encrypt")]
    public ActionResult<string> Encrypt([FromBody] EncryptionRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.EncryptedSymmetricKey))
                return BadRequest("Encrypted symmetric key is required.");

            string decryptedSymmetricKey = EncryptionService.DecryptSymmetricKeyWithPrivateKey(request.EncryptedSymmetricKey, _encryptionKey);

            string encryptedText = _encryptionService.EncryptString(request.PlainText);
            return Ok(encryptedText);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error encrypting: {ex.Message}");
        }
    }

    [HttpPost("decrypt")]
    public ActionResult<string> Decrypt([FromBody] DecryptionRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.PrivateKey))
                return BadRequest("Private key is required.");

            string decryptedSymmetricKey = EncryptionService.DecryptSymmetricKeyWithPrivateKey(_encryptionKey, request.PrivateKey);

            string decryptedText = _encryptionService.DecryptString(request.CipherText);
            return Ok(decryptedText);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error decrypting: {ex.Message}");
        }
    }
}
