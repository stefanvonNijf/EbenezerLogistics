<?php

namespace App\Mail;

use App\Models\Checkin;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LostItemsReplacementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Checkin    $checkin,
        public Collection $tools,
        public string     $pdfContent,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Tool replacement — {$this->checkin->employee->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.lost-items-replacement',
        );
    }

    public function attachments(): array
    {
        $filename = 'tool-replacement-' . str_replace(' ', '-', strtolower($this->checkin->employee->name)) . '.pdf';

        return [
            Attachment::fromData(fn() => $this->pdfContent, $filename)
                ->withMime('application/pdf'),
        ];
    }
}
