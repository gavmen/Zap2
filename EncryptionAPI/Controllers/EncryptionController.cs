using Microsoft.AspNetCore.Mvc;
using ChatApp.Services;


public class EncryptionRequest
{
    public string? PlainText { get; set; }
}

public class DecryptionRequest
{
    public string? CipherText { get; set; }
}


[ApiController]
[Route("[controller]")]
public class EncryptionController : ControllerBase
{
    private readonly EncryptionService _encryptionService;

    public EncryptionController()
    {
        string encryptionKey = EncryptionService.GenerateBase64Key();
        Console.WriteLine($"Generated Key: {encryptionKey}"); // For demonstration purposes
        _encryptionService = new EncryptionService(encryptionKey);
    }

    [HttpPost("encrypt")]
    public ActionResult<string> Encrypt([FromBody] EncryptionRequest request)
    {
        try
        {
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
            string decryptedText = _encryptionService.DecryptString(request.CipherText);
            return Ok(decryptedText);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error decrypting: {ex.Message}");
        }
    }
}
