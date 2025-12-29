export async function applyMatrixFilter(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // 1. Pixelate by downsizing
            // Target width suitable for "retro" look
            const targetWidth = 320;
            const scale = targetWidth / img.width;
            const targetHeight = Math.round(img.height * scale);

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Draw original resized
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // 2. Process Pixels
            const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Calculate Luminance (standard weights)
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                // Boost brightness slightly
                const boostedLuminance = Math.min(255, luminance * 1.3);

                // Thresholding with more detail tiers
                let newR = 0;
                let newG = 0;
                let newB = 0;

                if (boostedLuminance < 30) {
                    // Deep Black (Backgrounds)
                    newR = 0; newG = 5; newB = 0;
                } else if (boostedLuminance < 80) {
                    // Shadow Green
                    newR = 0; newG = 60; newB = 0;
                } else if (boostedLuminance < 140) {
                    // Mid Green
                    newR = 0; newG = 140; newB = 0;
                } else if (boostedLuminance < 210) {
                    // Matrix Bright Green
                    newR = 0; newG = 255; newB = 50;
                } else {
                    // Highlights (White-Green)
                    newR = 180; newG = 255; newB = 180;
                }

                data[i] = newR;
                data[i + 1] = newG;
                data[i + 2] = newB;
                // Alpha remains same
            }

            // Put back processing
            ctx.putImageData(imageData, 0, 0);

            // 3. Scanlines (Optional - simple alternating lines)
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            for (let y = 0; y < targetHeight; y += 2) {
                ctx.fillRect(0, y, targetWidth, 1);
            }

            // Export
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas conversion failed"));
                    return;
                }
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_matrix.jpg", { type: 'image/jpeg' });
                resolve(newFile);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.9);
        };

        img.onerror = () => {
            reject(new Error("Failed to load image"));
        };

        img.src = url;
    });
}
