import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-verification-overlay',
  standalone: true,
  templateUrl: './verification-overlay.html',
  styleUrl: './verification-overlay.css',
})
export class VerificationOverlayComponent {
  @Input() verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' = 'PENDING';
  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
