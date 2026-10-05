"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, ShieldAlert } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onScan: (decodedText: string) => void;
}

export function CameraScanner({ onScan }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer back/environment camera
          const cameraId = cameras[cameras.length - 1].id;
          await html5QrCode.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScan(decodedText);
            },
            () => {
              // quiet on frame missed
            }
          );
          setHasPermission(true);
          setScanning(true);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.warn("Camera init failed:", err);
        setHasPermission(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-black border border-white/10 relative">
      <div id={regionId} className="w-full aspect-square" />

      {hasPermission === false && (
        <div className="p-6 text-center space-y-2 bg-ink-950/90 text-xs">
          <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto" />
          <p className="text-zinc-300 font-semibold">Camera Access Unavailable</p>
          <p className="text-zinc-500">
            Please allow camera permissions or enter the QR verification token manually below.
          </p>
        </div>
      )}
    </div>
  );
}
