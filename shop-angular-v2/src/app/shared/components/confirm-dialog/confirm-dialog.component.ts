import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfirmService, ConfirmState } from '../../../core/services/confirm.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
    state: ConfirmState = { show: false };
    private sub: Subscription = new Subscription();

    constructor(private confirmService: ConfirmService) { }

    ngOnInit(): void {
        this.sub = this.confirmService.state$.subscribe(state => {
            this.state = state;
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onConfirm(): void {
        if (this.state.resolve) {
            this.state.resolve(true);
        }
        this.confirmService.close();
    }

    onCancel(): void {
        if (this.state.resolve) {
            this.state.resolve(false);
        }
        this.confirmService.close();
    }
}
