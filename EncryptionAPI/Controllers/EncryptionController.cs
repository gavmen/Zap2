using Microsoft.AspNetCore.Mvc;
using ChatApp.Services;

[ApiController]
[Route("[controller]")]
public class EncryptionController : ControllerBase
{
    private readonly EncryptionService _encryptionService;

    public EncryptionController()
    {
        _encryptionService = new EncryptionService("YourEncryptionKeyHere");
    }

    [HttpPost("encrypt")]
    public ActionResult<string> Encrypt([FromBody] string plainText)
    {
        try
        {
            string encryptedText = _encryptionService.EncryptString(plainText);
            return Ok(encryptedText);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error encrypting: {ex.Message}");
        }
    }

    [HttpPost("decrypt")]
    public ActionResult<string> Decrypt([FromBody] string cipherText)
    {
        try
        {
            string decryptedText = _encryptionService.DecryptString(cipherText);
            return Ok(decryptedText);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error decrypting: {ex.Message}");
        }
    }
}
