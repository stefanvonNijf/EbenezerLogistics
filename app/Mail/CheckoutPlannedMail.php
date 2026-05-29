<?php

namespace App\Mail;

use App\Models\Checkin;
use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CheckoutPlannedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Employee $employee,
        public Checkin  $checkin,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Checkout planned — {$this->employee->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.checkout-planned',
        );
    }
}
