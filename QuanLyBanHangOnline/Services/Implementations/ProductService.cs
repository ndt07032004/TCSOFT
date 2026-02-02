using Microsoft.EntityFrameworkCore;
using QuanLyBanHangOnline.DTO.Products;
using quanlybanhangonline.Models;
using QuanLyBanHangOnline.Services.Interfaces;
using QuanLyBanHangOnline.DTO.Generic;
using QuanLyBanHangOnline.Helpers;
using static QuanLyBanHangOnline.Constants.Enums; // Add this using

namespace QuanLyBanHangOnline.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ProductService(ApplicationDbContext context, IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(ProductFilterParams @params)
        {
            var query = from p in _context.Product
                        join d in _context.ProductDetail on p.IdSP equals d.IdSP into details
                        from d in details.DefaultIfEmpty()
                        select new { Product = p, Detail = d };

            // Apply Filters
            if (!string.IsNullOrEmpty(@params.Search))
            {
                var search = @params.Search.ToLower();
                query = query.Where(x => x.Product.Name.ToLower().Contains(search) || 
                                         (x.Detail != null && x.Detail.Description.ToLower().Contains(search)));
            }

            if (!string.IsNullOrEmpty(@params.Category))
            {
                // Parse string to Enum
                if (Enum.TryParse<ProductCategory>(@params.Category, true, out var categoryEnum))
                {
                    query = query.Where(x => x.Product.Category == categoryEnum);
                }
            }

            if (@params.MinPrice.HasValue)
            {
                query = query.Where(x => x.Product.Price >= @params.MinPrice.Value);
            }

            if (@params.MaxPrice.HasValue)
            {
                query = query.Where(x => x.Product.Price <= @params.MaxPrice.Value);
            }

            // Apply Sorting
            if (!string.IsNullOrEmpty(@params.SortBy))
            {
                switch (@params.SortBy)
                {
                    case "price_asc":
                        query = query.OrderBy(x => x.Product.Price);
                        break;
                    case "price_desc":
                        query = query.OrderByDescending(x => x.Product.Price);
                        break;
                    case "name":
                        query = query.OrderBy(x => x.Product.Name);
                        break;
                    default:
                        query = query.OrderBy(x => x.Product.IdSP);
                        break;
                }
            }
            else
            {
                query = query.OrderBy(x => x.Product.IdSP);
            }



            List<ProductResponseDto> dtos;
            int totalCount;
            int pageNumber = @params.PageNumber;
            int pageSize = @params.PageSize;

            if (@params.IsGrouped)
            {
                // GROUPING: Logic cũ hoặc mặc định không gộp nếu chưa có tiêu chí
                totalCount = await query.CountAsync();
                 var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                dtos = items.Select(x => MapToResponse(x.Product, x.Detail)).ToList();
            }
            else
            {
                // KHÔNG GỘP: Trả về danh sách phẳng (cho Admin Import, Quản lý kho)
                totalCount = await query.CountAsync();
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                dtos = items.Select(x => MapToResponse(x.Product, x.Detail)).ToList();
            }

            return new PagedResult<ProductResponseDto>(
                dtos,
                totalCount,
                pageNumber,
                pageSize
            );
        }
        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            // Tìm sản phẩm kèm theo bản ghi chi tiết của nó
            var product = await _context.Product.FindAsync(id);
            if (product == null) return null;

            var detail = await _context.ProductDetail.FirstOrDefaultAsync(d => d.IdSP == id);

            var dto = MapToResponse(product, detail);

            return dto;
        }

        public async Task<ProductResponseDto> CreateAsync(ProductCreateDto dto, int currentUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Xử lý lưu trữ hình ảnh sản phẩm
                string fileName = await ImgHelper.SaveImageAsync(dto.ImageFile, _environment.WebRootPath, "products");

                // 2. Khởi tạo và lưu thông tin vào bảng Product
                var product = new Product
                {
                    Name = dto.Name,
                    Price = dto.Price,
                    ImportPrice = dto.ImportPrice,
                    StockQuantity = dto.StockQuantity,
                    Category = dto.Category,
                    Image = fileName,
                    AverageRating = 0
                };
                _context.Product.Add(product);
                await _context.SaveChangesAsync(); // Lưu để sinh IdSP cho các bước sau

                // 3. Khởi tạo và lưu thông tin vào bảng ProductDetail
                var detail = new ProductDetail
                {
                    IdSP = product.IdSP,
                    Size = dto.Size,
                    Color = dto.Color,
                    Description = dto.Description ?? "",
                };
                _context.ProductDetail.Add(detail);

                // 4. TỰ ĐỘNG TẠO PHIẾU NHẬP (Dựa trên sơ đồ TPT: Account -> Admin/Staff)
                if (dto.StockQuantity > 0)
                {
                    var import = new Import
                    {
                        IdAccount = currentUserId, // Gán ID người thực hiện (Admin/Staff từ Token)
                        ImportDate = DateTime.Now,
                        TotalCost = dto.StockQuantity * dto.ImportPrice,
                        ImportDetails = new List<ImportDetail>
                {
                    new ImportDetail
                    {
                        IdSP = product.IdSP,
                        Quantity = dto.StockQuantity,
                        ImportPrice = dto.ImportPrice
                    }
                }
                    };
                    _context.Import.Add(import);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return MapToResponse(product, detail);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, ProductCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Product.FindAsync(id);
                var detail = await _context.ProductDetail.FirstOrDefaultAsync(d => d.IdSP == id);

                if (product == null) return false;

                // Cập nhật bảng Product
                product.Name = dto.Name;
                product.Price = dto.Price;
                product.ImportPrice = dto.ImportPrice;
                product.Category = dto.Category;
                product.StockQuantity = dto.StockQuantity;

                if (dto.ImageFile != null)
                {
                    ImgHelper.DeleteImage(_environment.WebRootPath, "products", product.Image);
                    product.Image = await ImgHelper.SaveImageAsync(dto.ImageFile, _environment.WebRootPath, "products");
                }

                // Cập nhật bảng ProductDetail (Nếu chưa có thì tạo mới, có rồi thì sửa)
                if (detail == null)
                {
                    detail = new ProductDetail { IdSP = id };
                    _context.ProductDetail.Add(detail);
                }
                detail.Size = dto.Size;
                detail.Color = dto.Color;
                detail.Description = dto.Description;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Product.FindAsync(id);
            if (product == null) return false;

            // Dùng ImgHelper để xóa cũ và lưu mới
            ImgHelper.DeleteImage(_environment.WebRootPath, "products", product.Image);
            _context.Product.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProductResponseDto MapToResponse(Product p, ProductDetail? d = null)
        {
            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            return new ProductResponseDto
            {
                IdSP = p.IdSP,
                Name = p.Name,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                Category = p.Category,
                ImageUrl = $"{baseUrl}/images/products/{p.Image}",
                AverageRating = p?.AverageRating ?? 0,
                // Gán thêm dữ liệu từ bảng Detail
                Size = d.Size,
                Color = d.Color,
                Description = d?.Description ?? "",
                
            };
        }

    }
}
