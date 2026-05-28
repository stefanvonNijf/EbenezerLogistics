<?php

namespace App\Mail;

use App\Models\Checkin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CheckinCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<array{name: string, content: string}>  $pdfAttachments
     */
    public function __construct(
        public Checkin $checkin,
        public array   $pdfAttachments = [],
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Check-in completed — {$this->checkin->employee->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.checkin-created',
        );
    }

    public function attachments(): array
    {
        return array_map(
            fn($a) => Attachment::fromData(fn() => $a['content'], $a['name'])->withMime('application/pdf'),
            $this->pdfAttachments
        );
    }
}
