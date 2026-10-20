const QRCode = require('qrcode');

const generateQrCodeDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    throw err;
  }
};

const generateQrCodeSvg = async (text) => {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      width: 320,
    });
  } catch (err) {
    console.error('Failed to generate QR Code SVG:', err);
    throw err;
  }
};

module.exports = {
  generateQrCodeDataUrl,
  generateQrCodeSvg,
};
