using System.ComponentModel.DataAnnotations;

namespace QuanLyBanHangOnline.DTO.Auth
{
    public class ResetPasswordDto
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}
