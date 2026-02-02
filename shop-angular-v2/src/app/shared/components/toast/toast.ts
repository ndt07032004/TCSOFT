import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.html',
})
export class ToastComponent implements OnInit {
    toasts: Toast[] = [];

    constructor(private toastService: ToastService) { }

    ngOnInit(): void {
        this.toastService.toasts$.subscribe(toasts => {
            this.toasts = toasts;
        });
    }

    remove(id: number) {
        this.toastService.remove(id);
    }
}
