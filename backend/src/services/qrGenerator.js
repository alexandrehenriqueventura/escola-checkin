const QRCode = require('qrcode');

async function gerarQRPorta(token, baseUrl) {
  const url = `${baseUrl}/check-in/${token}`;
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H', width: 400, margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' }
  });
}

async function gerarQRLista(salaId, baseUrl) {
  const url = `${baseUrl}/lista/${salaId}`;
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H', width: 400, margin: 2,
    color: { dark: '#0f3460', light: '#ffffff' }
  });
}

module.exports = { gerarQRPorta, gerarQRLista };
