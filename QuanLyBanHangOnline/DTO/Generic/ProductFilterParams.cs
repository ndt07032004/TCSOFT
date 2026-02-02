namespace QuanLyBanHangOnline.DTO.Generic
{
    public class ProductFilterParams : PaginationParams
    {
        public string? Search { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SortBy { get; set; }
        
        public bool IsGrouped { get; set; } = true;
    }
}
