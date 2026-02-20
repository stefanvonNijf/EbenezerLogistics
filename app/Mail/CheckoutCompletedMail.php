<?php

namespace App\Mail;

use App\Models\Checkin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CheckoutCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Checkin $checkin,
        public float   $totalMissingCost,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Checkout completed — {$this->checkin->employee->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.checkout-completed',
        );
    }
}
