import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RevenueService } from '../../../core/services/revenue.service';
import { ToastService } from '../../../core/services/toast.service';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-admin-revenue',
    templateUrl: './admin-revenue.html',
    styleUrls: ['./admin-revenue.scss']
})
export class AdminRevenueComponent implements OnInit {
    filterForm: FormGroup;
    loading = false;
    revenueData: any = null;
    hasData = false;

    // Chart Data
    dailyStats: any[] = [];
    maxRevenue: number = 0;

    constructor(
        private fb: FormBuilder,
        private revenueService: RevenueService,
        private toastService: ToastService
    ) {
        // Fix: Use local time for default values instead of UTC
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        const localDate = new Date(now.getTime() - offsetMs);
        const today = localDate.toISOString().split('T')[0];

        // Default start date to 1st of month (Local)
        const firstDayDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLocal = new Date(firstDayDate.getTime() - offsetMs);
        const firstDay = firstDayLocal.toISOString().split('T')[0];

        this.filterForm = this.fb.group({
            fromDate: [firstDay, Validators.required],
            toDate: [today, Validators.required]
        });
    }

    ngOnInit(): void {
        // Load data initially
        this.filterRevenue();
    }

    filterRevenue(): void {
        if (this.filterForm.invalid) return;

        this.loading = true;
        const { fromDate, toDate } = this.filterForm.value;

        this.revenueService.getRevenue(fromDate, toDate).subscribe({
            next: (data) => {
                this.revenueData = data;
                this.loading = false;
                this.hasData = true; // Always true if success, we will handle empty states in UI if needed

                this.calculateDailyStats();
            },
            error: (err) => {
                console.error('Error loading revenue:', err);
                this.loading = false;
                this.hasData = false;
                this.toastService.error('Lỗi tải báo cáo doanh thu');
            }
        });
    }

    calculateDailyStats(): void {
        if (!this.revenueData || !this.revenueData.orders) {
            this.dailyStats = [];
            return;
        }

        const stats: { [key: string]: number } = {};

        // Group orders by date
        this.revenueData.orders.forEach((order: any) => {
            const date = new Date(order.orderDate).toLocaleDateString('vi-VN'); // DD/MM/YYYY
            stats[date] = (stats[date] || 0) + order.totalPrice;
        });

        // Convert to array
        this.dailyStats = Object.keys(stats).map(date => ({
            date,
            revenue: stats[date]
        }));

        // Sort by date (simple string sort might fail for DD/MM/YYYY, need better sorting if crucial)
        // For visual, let's keep it simple or sort by timestamp if possible. 
        // Or re-map based on the date range loop.

        // Find max for scaling
        this.maxRevenue = Math.max(...this.dailyStats.map(s => s.revenue), 1); // Avoid 0 division
    }

    getBarHeight(revenue: number): string {
        const percentage = (revenue / this.maxRevenue) * 100;
        return `${Math.max(percentage, 1)}%`; // Min 1% height
    }

    // Helper to format currency
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    get totalProfit(): number {
        return (this.revenueData?.totalRevenue || 0) - (this.revenueData?.totalImportCost || 0);
    }

    exportToExcel(): void {
        if (!this.revenueData) return;

        // 1. Summary Sheet
        const summaryData = [
            { 'Chỉ số': 'Từ ngày', 'Giá trị': this.filterForm.value.fromDate },
            { 'Chỉ số': 'Đến ngày', 'Giá trị': this.filterForm.value.toDate },
            { 'Chỉ số': 'Tổng doanh thu', 'Giá trị': this.revenueData.totalRevenue },
            { 'Chỉ số': 'Tổng chi phí nhập', 'Giá trị': this.revenueData.totalImportCost },
            { 'Chỉ số': 'Lợi nhuận ròng', 'Giá trị': this.totalProfit },
            { 'Chỉ số': 'Tổng đơn hàng', 'Giá trị': this.revenueData.totalOrders }
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);

        // 2. Orders Sheet
        const orderData = (this.revenueData.orders || []).map((o: any, index: number) => ({
            'STT': index + 1,
            'Mã ĐH': o.idDH,
            'Ngày đặt': new Date(o.orderDate).toLocaleString('vi-VN'),
            'Khách hàng': o.receiverName || o.customerEmail,
            'Email': o.customerEmail,
            'Giá trị': o.totalPrice
        }));
        const wsOrders = XLSX.utils.json_to_sheet(orderData);
        wsOrders['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 15 }];

        // Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');
        XLSX.utils.book_append_sheet(wb, wsOrders, 'Chi tiết đơn hàng');

        XLSX.writeFile(wb, `BaoCaoLoiNhuan_${new Date().getTime()}.xlsx`);
    }
}
