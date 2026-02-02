import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmState {
    show: boolean;
    title?: string;
    message?: string;
    yesText?: string;
    noText?: string;
    resolve?: (result: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {
    private stateSubject = new Subject<ConfirmState>();
    state$ = this.stateSubject.asObservable();

    constructor() { }

    confirm(message: string, title: string = 'Xác nhận', yesText: string = 'Đồng ý', noText: string = 'Hủy'): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.stateSubject.next({
                show: true,
                title,
                message,
                yesText,
                noText,
                resolve
            });
        });
    }

    close() {
        this.stateSubject.next({ show: false });
    }
}
