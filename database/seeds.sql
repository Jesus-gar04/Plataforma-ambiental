-- ============================================================
-- SEEDS - DATOS DE PRUEBA
-- Plataforma de Educación Ambiental 2025
-- Password para todos: Test2025!
-- ============================================================

-- INSTITUCIONES
INSERT INTO institutions (code, name, address, city, department, phone, email, contact_person, max_students) VALUES
('INST001', 'Colegio Santa María', 'Calle 50 #30-45', 'Barranquilla', 'Atlántico', '3001234567', 'contacto@santamaria.edu.co', 'María González', 150),
('INST002', 'Instituto Técnico Industrial', 'Carrera 38 #75-20', 'Barranquilla', 'Atlántico', '3009876543', 'info@iti.edu.co', 'Carlos Rodríguez', 200)
ON CONFLICT (code) DO NOTHING;

-- USUARIO ROOT (Password: Test2025!)
INSERT INTO users (code, email, password_hash, role, first_name, last_name, document_type, document_number, is_active, email_verified) VALUES
('ROOT001', 'admin@unilibre.edu.co', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'root', 'Administrador', 'Sistema', 'CC', '1000000000', true, true)
ON CONFLICT (code) DO NOTHING;

-- DIRECTORES
INSERT INTO users (institution_id, code, email, password_hash, role, first_name, last_name, document_type, document_number, is_active, email_verified) VALUES
((SELECT id FROM institutions WHERE code = 'INST001'), 'INST001-DIR', 'director@santamaria.edu.co', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'director', 'María', 'González', 'CC', '1001234567', true, true)
ON CONFLICT (code) DO NOTHING;

-- ESTUDIANTES
INSERT INTO users (institution_id, code, email, password_hash, role, first_name, last_name, document_type, document_number, is_active, email_verified) VALUES
((SELECT id FROM institutions WHERE code = 'INST001'), 'INST001-EST001', 'estudiante1@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante', 'Juan', 'Pérez', 'TI', '1100000001', true, true),
((SELECT id FROM institutions WHERE code = 'INST001'), 'INST001-EST002', 'estudiante2@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'estudiante', 'María', 'García', 'TI', '1100000002', true, true)
ON CONFLICT (code) DO NOTHING;

-- CURSO
INSERT INTO courses (title, description, short_description, duration_hours, passing_score, start_date, end_date, created_by) VALUES
('Educación Ambiental y Sostenibilidad', 'Curso completo sobre educación ambiental.', 'Aprende sobre el medio ambiente.', 20, 75, '2025-01-15', '2025-12-31', (SELECT id FROM users WHERE role = 'root' LIMIT 1))
ON CONFLICT DO NOTHING;

-- MÓDULOS
INSERT INTO modules (course_id, title, description, order_index, duration_minutes, icon_name) VALUES
((SELECT id FROM courses LIMIT 1), 'Introducción a la Educación Ambiental', 'Conceptos básicos', 1, 300, 'leaf'),
((SELECT id FROM courses LIMIT 1), 'Ecosistemas y Biodiversidad', 'Explorando ecosistemas', 2, 300, 'tree'),
((SELECT id FROM courses LIMIT 1), 'Cambio Climático', 'Causas y efectos', 3, 300, 'thermometer'),
((SELECT id FROM courses LIMIT 1), 'Gestión de Residuos', 'Reciclaje y sostenibilidad', 4, 300, 'recycle')
ON CONFLICT (course_id, order_index) DO NOTHING;

SELECT '✅ Datos insertados correctamente' as status;