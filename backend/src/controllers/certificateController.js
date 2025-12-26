import { query, queryOne } from '../config/database.js';
import PDFDocument from 'pdfkit';
import { storage } from '../config/supabase.js';

export const generateCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await queryOne(
      `SELECT ce.*, u.first_name, u.last_name, u.document_type, u.document_number,
              c.title as course_title, c.passing_score
       FROM course_enrollments ce
       JOIN users u ON ce.user_id = u.id
       JOIN courses c ON ce.course_id = c.id
       WHERE ce.id = $1 AND ce.status = 'completado'`,
      [enrollmentId]
    );

    if (!enrollment) return res.status(404).json({ success: false, message: 'Inscripción no encontrada o curso no completado' });

    const existing = await queryOne('SELECT * FROM certificates WHERE enrollment_id = $1', [enrollmentId]);
    if (existing) return res.json({ success: true, data: existing });

    const certificateCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    await new Promise((resolve) => {
      doc.on('end', resolve);

      doc.fontSize(36).font('Helvetica-Bold').text('CERTIFICADO DE FINALIZACIÓN', 100, 100, { align: 'center' });
      doc.fontSize(16).font('Helvetica').text('La Universidad Libre Seccional Barranquilla', 100, 180, { align: 'center' });
      doc.fontSize(14).text('Otorga la presente certificación a:', 100, 220, { align: 'center' });
      doc.fontSize(28).font('Helvetica-Bold').text(`${enrollment.first_name} ${enrollment.last_name}`, 100, 260, { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(`${enrollment.document_type}: ${enrollment.document_number}`, 100, 300, { align: 'center' });
      doc.fontSize(16).text(`Por haber completado exitosamente el curso:`, 100, 340, { align: 'center' });
      doc.fontSize(20).font('Helvetica-Bold').text(enrollment.course_title, 100, 370, { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(`Código de certificado: ${certificateCode}`, 100, 440, { align: 'center' });
      doc.fontSize(12).text(`Emitido el: ${new Date().toLocaleDateString('es-CO')}`, 100, 470, { align: 'center' });
      
      doc.end();
    });

    const pdfBuffer = Buffer.concat(buffers);
    const filePath = `certificates/${certificateCode}.pdf`;

    const uploadResult = await storage.uploadFile(process.env.STORAGE_BUCKET_CERTIFICATES, filePath, pdfBuffer, {
      contentType: 'application/pdf'
    });

    const certificate = await queryOne(
      `INSERT INTO certificates (enrollment_id, certificate_code, issued_date, final_score, certificate_url)
       VALUES ($1, $2, CURRENT_DATE, $3, $4) RETURNING *`,
      [enrollmentId, certificateCode, enrollment.progress_percentage, uploadResult.url]
    );

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al generar certificado', error: error.message });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await queryOne(
      `SELECT c.*, u.first_name, u.last_name, co.title as course_title
       FROM certificates c
       JOIN course_enrollments ce ON c.enrollment_id = ce.id
       JOIN users u ON ce.user_id = u.id
       JOIN courses co ON ce.course_id = co.id
       WHERE c.certificate_code = $1 AND c.is_valid = true`,
      [code]
    );

    if (!certificate) return res.status(404).json({ success: false, message: 'Certificado no encontrado' });

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al verificar certificado' });
  }
};

export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await query(
      `SELECT c.*, co.title as course_title
       FROM certificates c
       JOIN course_enrollments ce ON c.enrollment_id = ce.id
       JOIN courses co ON ce.course_id = co.id
       WHERE ce.user_id = $1
       ORDER BY c.issued_date DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: certificates.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener certificados' });
  }
};

export default { generateCertificate, verifyCertificate, getMyCertificates };