using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyBanHangOnline.Migrations
{
    public partial class FixCartAccountFK : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Users_IdUser",
                table: "Cart");

            migrationBuilder.DeleteData(
                table: "Admins",
                keyColumn: "IdAccount",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Staffs",
                keyColumn: "IdAccount",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 5);

            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "IdAccount", "Email", "Password", "RefreshToken", "RefreshTokenExpiryTime", "RoleType" },
                values: new object[,]
                {
                    { 1, "admin@gmail.com", "$2a$11$XAd2yTf1KTb7iEE4T0HMQenxRMAIqdZ5eF7df8MKm8RplebD9YhfW", null, null, "Admin" },
                    { 2, "staff@gmail.com", "$2a$11$OJRQgTA7jQmLlEoVaV2AneRPummFj1XUqDc.c.O6UTitdfuONvNbC", null, null, "Staff" },
                    { 3, "user@gmail.com", "$2a$11$4q8ybkH2l67xW.Bzl73SvOnC31zIPiknLUHetobb.5H2ILloDdSBS", null, null, "User" },
                    { 4, "nxtql99@gmail.com", "$2a$11$jFwtr1kFr0GLnRPBx5Wnf.LZl42CIdu6PCVOfselFjjuPo1qHfEwu", null, null, "User" },
                    { 5, "ndt@gmail.com", "$2a$11$q7QSHUjQ/gl5TUn1GLkdEOwoob7P3nHQdkCzp1We7jdlgZ3wwxQc6", null, null, "User" }
                });

            migrationBuilder.InsertData(
                table: "Admins",
                column: "IdAccount",
                value: 1);

            migrationBuilder.InsertData(
                table: "Staffs",
                columns: new[] { "IdAccount", "Address", "FullName", "Phone", "RoleId", "Salary" },
                values: new object[] { 2, null, null, null, null, null });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "IdAccount", "Address", "FullName", "Phone" },
                values: new object[,]
                {
                    { 3, null, null, null },
                    { 4, null, null, null },
                    { 5, null, null, null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Accounts_IdUser",
                table: "Cart",
                column: "IdUser",
                principalTable: "Accounts",
                principalColumn: "IdAccount",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cart_Accounts_IdUser",
                table: "Cart");

            migrationBuilder.DeleteData(
                table: "Admins",
                keyColumn: "IdAccount",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Staffs",
                keyColumn: "IdAccount",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "IdAccount",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "IdAccount",
                keyValue: 5);

            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "IdAccount", "Email", "Password", "RefreshToken", "RefreshTokenExpiryTime", "RoleType" },
                values: new object[,]
                {
                    { 1, "admin@gmail.com", "$2a$11$8u.ZILCeUR4tajyB/X40ieFIatR1RGHYk9zmeT7iWNbrvIdPdZsc2", null, null, "Admin" },
                    { 2, "staff@gmail.com", "$2a$11$mAOBb9x5fo8fT.pZdFzqwuSfkR/z/f6rz6yvzKd8gc7GjIRatkX9G", null, null, "Staff" },
                    { 3, "user@gmail.com", "$2a$11$CwgJ.cTY/VaJy9NZBHYVwuqKqncp37ELAAE5Y2T2Ww9PHS2PEHMX2", null, null, "User" },
                    { 4, "nxtql99@gmail.com", "$2a$11$hdmZ9g5Hi9sjIHgZX2QNAOkdOrlNvfABJRlUw/DUSWk5VPCJiQ7GG", null, null, "User" },
                    { 5, "ndt@gmail.com", "$2a$11$2I8R8lExKDyVMQv6uKKoqeTVaMAb2kHYzKCs3FOSQnNwHqo.tedK6", null, null, "User" }
                });

            migrationBuilder.InsertData(
                table: "Admins",
                column: "IdAccount",
                value: 1);

            migrationBuilder.InsertData(
                table: "Staffs",
                columns: new[] { "IdAccount", "Address", "FullName", "Phone", "RoleId", "Salary" },
                values: new object[] { 2, null, null, null, null, null });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "IdAccount", "Address", "FullName", "Phone" },
                values: new object[,]
                {
                    { 3, null, null, null },
                    { 4, null, null, null },
                    { 5, null, null, null }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Cart_Users_IdUser",
                table: "Cart",
                column: "IdUser",
                principalTable: "Users",
                principalColumn: "IdAccount",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
