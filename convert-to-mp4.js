// /api/convert-to-mp4.js
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read raw body as buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const inputBuffer = Buffer.concat(chunks);

    const timestamp = Date.now();
    const inputPath = `/tmp/input-${timestamp}.webm`;
    const outputPath = `/tmp/output-${timestamp}.mp4`;

    // Write input to temp file
    fs.writeFileSync(inputPath, inputBuffer);

    // Convert to Instagram-compatible MP4
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',        // H.264 video (required by Instagram)
          '-preset ultrafast',   // Fast encoding
          '-crf 23',             // Good quality
          '-c:a aac',            // AAC audio (required by Instagram)
          '-b:a 128k',           // 128kbps audio
          '-r 30',               // Constant 30fps (fixes stutter)
          '-movflags +faststart',// Optimized for web
          '-pix_fmt yuv420p'     // Maximum compatibility
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Read the converted file
    const outputBuffer = fs.readFileSync(outputPath);

    // Cleanup temp files
    try { fs.unlinkSync(inputPath); } catch(e) {}
    try { fs.unlinkSync(outputPath); } catch(e) {}

    // Send MP4 response
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', outputBuffer.length);
    res.send(outputBuffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed', details: error.message });
  }
}