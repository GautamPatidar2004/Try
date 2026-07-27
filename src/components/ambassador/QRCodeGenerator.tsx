import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAmbassador } from "@/hooks/useAmbassador";
import { useToast } from "@/hooks/use-toast";

export const QRCodeGenerator = () => {
  const { getReferralLink } = useAmbassador();
  const { toast } = useToast();
  const [size, setSize] = useState<"256" | "512" | "1024">("512");
  const [includeText, setIncludeText] = useState(true);

  const referralLink = getReferralLink();

  const downloadQRCode = (format: "png" | "svg") => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    if (format === "svg") {
      const svgStringForDownload = svg.outerHTML;
      const blob = new Blob([svgStringForDownload], { type: "image/svg+xml;charset=utf-8" });
      const urlForDownload = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlForDownload;
      a.download = `hostfluencer-qr-code.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlForDownload);
      const canvas = document.createElement("canvas");
      const sizeNum = parseInt(size);
      canvas.width = sizeNum;
      canvas.height = includeText ? sizeNum + 100 : sizeNum;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      const serializer = new window.DOMParser();
      const svgStringForPNG = svg.outerHTML;
      const img = document.createElement('img');
      const svgBlob = new Blob([svgStringForPNG], { type: "image/svg+xml;charset=utf-8" });
      const urlForPNG = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, sizeNum, sizeNum);

        // Add text if enabled
        if (includeText) {
          ctx.fillStyle = "#1f2937";
          ctx.font = `bold ${sizeNum / 20}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText("Scan to Join Hostfluencer", canvas.width / 2, sizeNum + 40);
          ctx.font = `${sizeNum / 25}px Arial`;
          ctx.fillStyle = "#10b981";
          ctx.fillText("Ambassador Referral", canvas.width / 2, sizeNum + 70);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `hostfluencer-qr-code-${size}.png`;
            a.click();
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(urlForPNG);
          }
        }, "image/png");
      };

      img.src = urlForPNG;
    }

    toast({
      title: "QR Code downloaded",
      description: `Your ${format.toUpperCase()} QR code has been downloaded.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>
          Generate a scannable QR code for your referral link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={referralLink}
                size={parseInt(size)}
                level="H"
                includeMargin={true}
                fgColor="#10b981"
              />
              {includeText && (
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold text-foreground">Scan to Join Hostfluencer</p>
                  <p className="text-xs text-brand-green font-medium">Ambassador Referral</p>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">QR Code Size</Label>
              <RadioGroup value={size} onValueChange={(v) => setSize(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="256" id="size-256" />
                  <Label htmlFor="size-256" className="cursor-pointer">
                    Small (256x256px) - Social media
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="512" id="size-512" />
                  <Label htmlFor="size-512" className="cursor-pointer">
                    Medium (512x512px) - Presentations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1024" id="size-1024" />
                  <Label htmlFor="size-1024" className="cursor-pointer">
                    Large (1024x1024px) - Printing
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-text"
                checked={includeText}
                onChange={(e) => setIncludeText(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="include-text" className="cursor-pointer">
                Include descriptive text below QR code
              </Label>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                className="w-full gap-2"
                onClick={() => downloadQRCode("png")}
              >
                <Download className="h-4 w-4" />
                Download as PNG
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => downloadQRCode("svg")}
              >
                <Download className="h-4 w-4" />
                Download as SVG
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Use PNG for online sharing and SVG for print materials. 
                Large sizes work best for posters and banners.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
