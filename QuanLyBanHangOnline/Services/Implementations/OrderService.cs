    using System;
    using Microsoft.EntityFrameworkCore;
    using QuanLyBanHangOnline.DTO;
    using QuanLyBanHangOnline.Services.Interfaces;
    using quanlybanhangonline.Models;
    using quanlybanhangonline.Models.DTOs;
    using QuanLyBanHangOnline.Constants;
    using QuanLyBanHangOnline.DTO.OrderDetailRequestDto;
    using QuanLyBanHangOnline.DTO.Generic;
    using QuanLyBanHangOnline.DTO.Generic;
    using QuanLyBanHangOnline.Helpers;
    using quanlybanhangonline.Model; // Cart
    using quanlybanhangonline.Models; // CartDetail

    namespace QuanLyBanHangOnline.Services.Implementations
    {
        public class OrderService : IOrderService
        {
            private readonly ApplicationDbContext _context;

            public OrderService(ApplicationDbContext context)
            {
                _context = context;
            }

            // 1. Cho Admin xem toàn bộ
            public async Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(PaginationParams @params)
            {
                var query = _context.Order
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .AsQueryable();

                if (@params.FromDate.HasValue)
                    query = query.Where(o => o.OrderDate >= @params.FromDate.Value);
                if (@params.ToDate.HasValue)
                {
                    // Update: ToDate inclusive (end of day)
                    var toDate = @params.ToDate.Value.Date.AddDays(1).AddTicks(-1);
                    query = query.Where(o => o.OrderDate <= toDate);
                }

                if (!string.IsNullOrEmpty(@params.Status) && Enum.TryParse<Enums.OrderStatus>(@params.Status, true, out var statusEnum))
                {
                    query = query.Where(o => o.Status == statusEnum);
                }

                var finalQuery = query
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => MapToResponseDto(o));

                return await finalQuery.ToPagedResultAsync(@params.PageNumber, @params.PageSize);
            }

            public async Task<OrderResponseDto?> GetOrderByIdAsync(int id)
            {
                var order = await _context.Order
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.IdDH == id);

                if (order == null) return null;

                return MapToResponseDto(order);
            }

            // 2. Cho Khách hàng xem đơn của họ
            public async Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, PaginationParams @params)
            {
                var query = _context.Order
                    .Where(o => o.IdUser == userId)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .AsQueryable();

                if (@params.FromDate.HasValue)
                    query = query.Where(o => o.OrderDate >= @params.FromDate.Value);
                if (@params.ToDate.HasValue)
                {
                     var toDate = @params.ToDate.Value.Date.AddDays(1).AddTicks(-1);
                     query = query.Where(o => o.OrderDate <= toDate);
                }

                if (!string.IsNullOrEmpty(@params.Status) && Enum.TryParse<Enums.OrderStatus>(@params.Status, true, out var statusEnum))
                {
                    query = query.Where(o => o.Status == statusEnum);
                }

                var finalQuery = query
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => MapToResponseDto(o));

                return await finalQuery.ToPagedResultAsync(@params.PageNumber, @params.PageSize);
            }
            public async Task<OrderResponseDto> CreateOrderAsync(int userId, OrderRequestDto request)
            {
                // Sử dụng Transaction để đảm bảo nếu trừ kho lỗi thì đơn hàng không được tạo
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var newOrder = new Order
                    {
                        IdUser = userId,
                        OrderDate = DateTime.Now,
                        Status = Enums.OrderStatus.ChoXacNhan,
                        TotalPrice = 0,
                        // --- CẬP NHẬT: Gán thông tin giao hàng từ DTO vào Model ---
                        ReceiverName = request.ReceiverName,
                        ReceiverPhone = request.ReceiverPhone,
                        ShippingAddress = request.ShippingAddress,
                        OrderNotes = request.OrderNotes,
                        OrderDetails = new List<OrderDetail>()
                    };

                    foreach (var item in request.Items)
                    {
                        var product = await _context.Product.FindAsync(item.IdSP);
                        if (product == null) throw new Exception($"Sản phẩm {item.IdSP} không tồn tại.");

                        // KIỂM TRA TỒN KHO
                        if (product.StockQuantity < item.Quantity)
                            throw new Exception($"Sản phẩm '{product.Name}' không đủ số lượng trong kho (Còn lại: {product.StockQuantity}).");

                        // TRỪ KHO
                        product.StockQuantity -= item.Quantity;

                        // 4. QUAN TRỌNG: XÓA SẢN PHẨM NÀY KHỎI GIỎ HÀNG (CartDetail)
                        var cart = await _context.Cart.FirstOrDefaultAsync(c => c.IdUser == userId);
                        if (cart != null)
                        {
                            var cartItemToDelete = await _context.CartDetail
                                .FirstOrDefaultAsync(cd => cd.IdCart == cart.IdCart && cd.IdSP == item.IdSP);

                            if (cartItemToDelete != null)
                            {
                                _context.CartDetail.Remove(cartItemToDelete);
                            }
                        }

                    var detail = new OrderDetail
                        {
                            IdSP = item.IdSP,
                            Quantity = item.Quantity,
                            Price = product.Price
                        };
                       
                        newOrder.TotalPrice += (detail.Price * detail.Quantity);
                        newOrder.OrderDetails.Add(detail);
                    }

                    _context.Order.Add(newOrder);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync(); // Hoàn tất giao dịch

                    return MapToResponseDto(newOrder);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync(); // Nếu lỗi thì trả lại dữ liệu ban đầu
                    throw;
                }
            }

        public async Task<bool> UpdateStatusAsync(int id, Enums.OrderStatus newStatus, int userId, string userRole)
        {
            var order = await _context.Order
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.IdDH == id);

            if (order == null) return false;

            // Kiểm tra quyền sở hữu
            if (userRole != "Admin" && userRole != "Staff" && order.IdUser != userId) return false;

            // --- LOGIC QUAN TRỌNG: XỬ LÝ KHO KHI THAY ĐỔI TRẠNG THÁI ---

            // TRƯỜNG HỢP 1: HỦY ĐƠN (Hoàn kho)
            if (newStatus == Enums.OrderStatus.DaHuy && order.Status != Enums.OrderStatus.DaHuy)
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Product.FindAsync(detail.IdSP);
                    if (product != null) product.StockQuantity += detail.Quantity;
                }
            }

            // TRƯỜNG HỢP 2: KHÁCH XÁC NHẬN LẠI ĐƠN ĐÃ HỦY (Trừ kho lại)
            else if (newStatus == Enums.OrderStatus.ChoXacNhan && order.Status == Enums.OrderStatus.DaHuy)
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Product.FindAsync(detail.IdSP);
                    if (product == null || product.StockQuantity < detail.Quantity)
                    {
                        throw new Exception($"Sản phẩm '{product?.Name}' không đủ hàng để đặt lại.");
                    }
                    product.StockQuantity -= detail.Quantity;
                }
            }

            order.Status = newStatus;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteOrderAsync(int id, int userId, string userRole)
            {
                var order = await _context.Order
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.IdDH == id);

                if (order == null) return false;

                // Kiểm tra quyền sở hữu
                if (userRole != "Admin" && userRole != "Staff" && order.IdUser != userId)
                    return false;

                // CHỈ cho phép hủy (xóa) khi đơn đang chờ xác nhận
                if (order.Status != Enums.OrderStatus.ChoXacNhan)
                    return false;

                // Hoàn kho trước khi xóa (hoặc chuyển trạng thái)
                foreach (var detail in order.OrderDetails)
                {
                    var product = await _context.Product.FindAsync(detail.IdSP);
                    if (product != null)
                    {
                        product.StockQuantity += detail.Quantity;
                    }
                }

                _context.Order.Remove(order); // Hoặc order.Status = Enums.OrderStatus.DaHuy;
                await _context.SaveChangesAsync();
                return true;
            }

            // Hàm phụ dùng chung để ánh xạ dữ liệu
            private static OrderResponseDto MapToResponseDto(Order order)
            {
                return new OrderResponseDto
                {
                    IdDH = order.IdDH,
                    OrderDate = order.OrderDate,
                    TotalPrice = order.TotalPrice,
                    Status = order.Status.ToString(),
                    IdUser = order.IdUser,

                    // --- BỔ SUNG: Trả về thông tin giao hàng ---
                    ReceiverName = order.ReceiverName,
                    ReceiverPhone = order.ReceiverPhone,
                    ShippingAddress = order.ShippingAddress,
                    OrderNotes = order.OrderNotes ?? "Không có ghi chú",

                    Items = order.OrderDetails?.Select(od => new OrderDetailResponseDto
                    {
                        IdSP = od.IdSP,
                        ProductName = od.Product?.Name ?? "Sản phẩm không xác định",
                        Quantity = od.Quantity,
                        Price = od.Price
                    }).ToList() ?? new List<OrderDetailResponseDto>()
                };
            }
            public async Task<bool> UpdateOrderDetailAsync(int detailId, OrderDetail detail)
            {
                var existingDetail = await _context.OrderDetail
                    .Include(od => od.Product) // Cần product để trừ/cộng kho
                    .FirstOrDefaultAsync(od => od.IdOrderDetail == detailId);

                if (existingDetail == null) return false;

                var order = await _context.Order.Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.IdDH == existingDetail.IdDH);

                // Chỉ cho sửa nếu đơn đang chờ xác nhận
                if (order == null || order.Status != Enums.OrderStatus.ChoXacNhan) return false;

                // Tính chênh lệch: Số lượng mới - Số lượng cũ
                int diff = detail.Quantity - existingDetail.Quantity;

                // Nếu tăng số lượng, kiểm tra kho có đủ không
                if (diff > 0 && existingDetail.Product.StockQuantity < diff) return false;

                // Cập nhật kho
                existingDetail.Product.StockQuantity -= diff;

                // Cập nhật thông tin chi tiết
                existingDetail.Quantity = detail.Quantity;
                existingDetail.Price = detail.Price;

                // Tính lại tổng tiền cho đơn hàng
                order.TotalPrice = order.OrderDetails.Sum(d => d.Price * d.Quantity);

                await _context.SaveChangesAsync();
                return true;
            }

            public async Task<bool> DeleteOrderDetailAsync(int detailId)
            {
                // 1. Tìm món hàng kèm theo Product để hoàn kho
                var detail = await _context.OrderDetail
                    .Include(od => od.Product)
                    .FirstOrDefaultAsync(od => od.IdOrderDetail == detailId);

                if (detail == null) return false;

                // 2. Tìm đơn hàng cha
                var order = await _context.Order
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.IdDH == detail.IdDH);

                // 3. Chỉ cho xóa nếu đơn hàng đang "Chờ xác nhận"
                if (order == null || order.Status != Enums.OrderStatus.ChoXacNhan) return false;

                // 4. HOÀN KHO: Cộng lại số lượng vào Stock trước khi xóa bản ghi
                if (detail.Product != null)
                {
                    detail.Product.StockQuantity += detail.Quantity;
                }

                // 5. Xóa món hàng
                _context.OrderDetail.Remove(detail);

                // 6. Tính lại tổng tiền cho đơn hàng từ các món còn lại
                order.TotalPrice = order.OrderDetails
                    .Where(d => d.IdOrderDetail != detailId)
                    .Sum(d => d.Price * d.Quantity);

                await _context.SaveChangesAsync();
                return true;
            }

            public async Task<IEnumerable<OrderDetailResponseDto>> GetDetailsByOrderIdAsync (int orderId)
            {
                return await _context.OrderDetail
                    .Where(od => od.IdDH == orderId)
                    .Include(od => od.Product) // Để lấy được ProductName
                    .Select(od => new OrderDetailResponseDto
                    {
                        IdOrderDetail = od.IdOrderDetail,
                        IdSP = od.IdSP,
                        ProductName = od.Product.Name, // Ánh xạ tên sản phẩm
                        Quantity = od.Quantity,
                        Price = od.Price
                        // SubTotal tự động tính theo công thức bạn đã viết trong DTO
                    })
                    .ToListAsync();
            }

            public async Task<string> ReOrderAsync(int orderId, int userId)
            {
                // 1. Lấy thông tin đơn hàng cũ
                var order = await _context.Order
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                    .FirstOrDefaultAsync(o => o.IdDH == orderId);

                if (order == null) throw new Exception("Không tìm thấy đơn hàng.");
                if (order.IdUser != userId) throw new Exception("Bạn không có quyền thao tác trên đơn hàng này.");

                // 2. Duyệt qua từng sản phẩm trong đơn hàng cũ
                int countAdded = 0;
                // Cần inject CartService vào đây, nhưng hiện tại OrderService chưa có CartService.
                // Để tránh Circle Dependency (CartService cũng gọi OrderService), ta xử lý thủ công hoặc Inject Lazy
                // TẠM THỜI: Xử lý thêm vào Cart thủ công tại đây để nhanh chóng (giống logic AddToCart)

                // Tìm giỏ hàng hiện tại
                var cart = await _context.Cart.FirstOrDefaultAsync(c => c.IdUser == userId);
                if (cart == null)
                {
                    cart = new Cart { IdUser = userId, Status = 1 };
                    _context.Cart.Add(cart);
                    await _context.SaveChangesAsync(); // Lưu để có IdCart
                }

                foreach (var item in order.OrderDetails)
                {
                    // Kiểm tra sản phẩm còn tồn tại và còn hàng không
                    var product = await _context.Product.FindAsync(item.IdSP);
                    if (product == null || product.StockQuantity <= 0) continue; // Bỏ qua nếu hết hàng

                    // Kiểm tra trong giỏ đã có chưa
                    var existingDetail = await _context.CartDetail
                        .FirstOrDefaultAsync(cd => cd.IdCart == cart.IdCart && cd.IdSP == item.IdSP);

                    if (existingDetail == null)
                    {
                        var newDetail = new CartDetail
                        {
                            IdCart = cart.IdCart,
                            IdSP = item.IdSP,
                            Quantity = 1 // Mặc định mua lại 1 cái, hoặc item.Quantity nếu muốn
                        };
                        _context.CartDetail.Add(newDetail);
                        countAdded++;
                    }
                    else 
                    {
                        // Nếu đã có thì có thể để nguyên hoặc cộng thêm? Thường là để nguyên.
                        // Ở đây ta để nguyên context "Mua lại" -> Đảm bảo nó có trong giỏ
                    }
                }

                await _context.SaveChangesAsync();
                
                if (countAdded == 0) return "Không có sản phẩm nào được thêm (có thể do hết hàng hoặc đã có trong giỏ).";
                return $"Đã thêm {countAdded} sản phẩm vào giỏ hàng.";
            }
        }
    }