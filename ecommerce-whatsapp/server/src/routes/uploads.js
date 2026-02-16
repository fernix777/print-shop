import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Usamos almacenamiento en memoria para acceder al buffer del archivo
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Subida de imagen de producto
router.post('/product-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió el archivo' });
    }

    const folder = req.body.folder || '';
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 12);
    const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
    const fileName = `${timestamp}-${random}.${ext}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message || 'Error subiendo imagen' });
    }

    const { data: publicData } = await supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return res.json({
      url: publicData.publicUrl,
      path: filePath
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

export default router;
