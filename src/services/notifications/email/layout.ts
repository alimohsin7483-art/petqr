export function emailLayout(opts: {
  preheader?: string;
  heading: string;
  body: string; // inner HTML, already-safe (built from our own templates, no raw user HTML)
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { preheader = "", heading, body, ctaLabel, ctaUrl } = opts;

  return `<!doctype html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
  <body style="margin:0;padding:0;background-color:#F6F3EC;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#132A3E;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border:1px solid #DED7C7;border-radius:22px;">
            <tr>
              <td style="padding:36px 32px;">
                <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#A66F2A;margin:0 0 8px;">
                  PetLink
                </p>
                <h1 style="font-size:24px;font-weight:600;margin:0 0 20px;color:#132A3E;">${heading}</h1>
                <div style="font-size:14px;line-height:1.6;color:rgba(19,42,62,0.75);">${body}</div>
                ${
                  ctaUrl && ctaLabel
                    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:24px;background:#132A3E;color:#F6F3EC;text-decoration:none;font-size:14px;font-weight:500;padding:12px 24px;border-radius:9999px;">${ctaLabel}</a>`
                    : ""
                }
              </td>
            </tr>
          </table>
          <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:rgba(19,42,62,0.3);margin-top:24px;">
            PetLink · petlink.app
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
