const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a canvas of 500x500 pixels
const canvas = createCanvas(500, 500);
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 230;

// Create a circular seal
function drawSeal() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create circular background
    const gradient = ctx.createRadialGradient(centerX, centerY, radius-100, centerX, centerY, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#e8f4f9');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Outer border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4baed5';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Inner border circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 30, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4baed5';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Company name - outer circle text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#0078a9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text in a circle
    drawCircularText('HM SENADHEERA WATERPROOFINGS • SRI LANKA •', centerX, centerY, radius - 15, 0);
    
    // Inner text
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#0078a9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STOP', centerX, centerY - 80);
    ctx.fillText('WATERLEAKS!', centerX, centerY - 40);
    
    // Experience text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('15+ YEARS', centerX, centerY + 20);
    ctx.fillText('EXPERIENCE', centerX, centerY + 50);
    
    // Warranty text
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#d9534f';
    ctx.fillText('10 YEARS WARRANTY', centerX, centerY + 95);
    
    // Guarantee text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#2e6da4';
    ctx.fillText('LIFETIME GUARANTEE', centerX, centerY + 135);
    
    // Add a star border
    drawStarBorder(centerX, centerY, radius - 60, 12, 0.4);
}

// Function to draw text in a circle
function drawCircularText(text, centerX, centerY, radius, startAngle) {
    const letterCount = text.length;
    const angleStep = (2 * Math.PI) / letterCount;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle);
    
    for (let i = 0; i < letterCount; i++) {
        const angle = i * angleStep;
        ctx.rotate(angle);
        ctx.save();
        ctx.translate(0, -radius);
        const letter = text[i];
        ctx.fillText(letter, 0, 0);
        ctx.restore();
        ctx.rotate(-angle);
    }
    
    ctx.restore();
}

// Function to draw a star border
function drawStarBorder(centerX, centerY, radius, pointCount, inset) {
    ctx.beginPath();
    
    for (let i = 0; i < pointCount * 2; i++) {
        const angle = (i * Math.PI) / pointCount;
        const r = i % 2 === 0 ? radius : radius * inset;
        const x = centerX + r * Math.sin(angle);
        const y = centerY + r * Math.cos(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.strokeStyle = '#4baed5';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw the seal
drawSeal();

// Save PNG
const pngBuffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'assets', 'hmsenadheera_seal.png'), pngBuffer);
console.log('PNG seal saved to assets/hmsenadheera_seal.png');

// Save JPG
const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
fs.writeFileSync(path.join(__dirname, 'assets', 'hmsenadheera_seal.jpg'), jpgBuffer);
console.log('JPG seal saved to assets/hmsenadheera_seal.jpg');

// Create a smaller version for using in the quotation
const sealWidth = 200;
const sealHeight = 200;
const smallCanvas = createCanvas(sealWidth, sealHeight);
const smallCtx = smallCanvas.getContext('2d');

// Draw the image scaled down
smallCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, sealWidth, sealHeight);

// Save small PNG
const smallPngBuffer = smallCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'assets', 'hmsenadheera_seal_small.png'), smallPngBuffer);
console.log('Small PNG seal saved to assets/hmsenadheera_seal_small.png');

console.log('All seal images have been generated successfully!'); 