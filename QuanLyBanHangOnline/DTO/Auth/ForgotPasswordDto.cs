using System.ComponentModel.DataAnnotations;

namespace QuanLyBanHangOnline.DTO.Auth
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
