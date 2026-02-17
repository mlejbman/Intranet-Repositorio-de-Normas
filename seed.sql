
-- LIMPIEZA DE DATOS EXISTENTES
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- 1. INSERCIÓN DE PERFILES CORPORATIVOS
INSERT INTO profiles (id, name, email, role, area)
VALUES 
('a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab', 'María L. (Admin)', 'mlejbman@gmail.com', 'ADMIN', 'General'),
('b2c3d4e5-f6a7-4b2c-9d3e-2345678901bc', 'Juan F. (Editor)', 'juanf@retail.com.ar', 'EDITOR', 'Sistemas'),
('c3d4e5f6-a7b8-4c3d-0e4f-3456789012cd', 'Diego L. (Usuario)', 'diegol@retail.com.ar', 'USER', 'Operaciones');

-- 2. INSERCIÓN MASIVA DE DOCUMENTOS (5 POR ÁREA) CON PDFS FUNCIONALES

-- ÁREA: GENERAL
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Manual de Bienvenida y Cultura', 'GRAL-001', '2.0', 'General', '{Cultura, Onboarding}', 'Visión, misión y valores fundamentales de la compañía.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Código de Ética y Conducta Profesional', 'GRAL-002', '4.1', 'General', '{Ética, Compliance}', 'Normas de comportamiento y prevención de conflictos de interés.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Protocolo de Seguridad Física en Tiendas', 'GRAL-003', '1.5', 'General', '{Seguridad, Prevención}', 'Procedimientos ante incidentes, robos o emergencias médicas.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Política de Uso de Uniformes e Imagen', 'GRAL-004', '1.0', 'General', '{Imagen, Vestimenta}', 'Estándares de presencia para personal de cara al público.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Manual de Gestión de Crisis y Comunicación', 'GRAL-005', '3.0', 'General', '{Comunicación, Crisis}', 'Flujo de información ante eventos críticos externos.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');

-- ÁREA: ADMINISTRACIÓN Y FINANZAS
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Protocolo de Arqueo y Cierre de Caja', 'FIN-001', '2.3', 'Administración y Finanzas', '{Cajas, Auditoría}', 'Procedimiento mandatorio de rendición de valores diarios.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Política de Reembolso de Gastos de Viaje', 'FIN-002', '1.2', 'Administración y Finanzas', '{Gastos, Viáticos}', 'Límites y requisitos para la rendición de gastos corporativos.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Gestión de Fondo Fijo y Caja Chica', 'FIN-003', '1.0', 'Administración y Finanzas', '{Efectivo, Tienda}', 'Normativa para gastos menores y urgencias en sucursales.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Procedimiento de Facturación y Notas de Crédito', 'FIN-004', '3.5', 'Administración y Finanzas', '{AFIP, Ventas}', 'Reglas para la emisión de documentos legales de venta.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Norma de Auditoría Externa de Valores', 'FIN-005', '2.0', 'Administración y Finanzas', '{Control, Tesorería}', 'Frecuencia y metodología de inspecciones financieras.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');

-- ÁREA: COMERCIAL
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Manual de Merchandising Visual', 'COM-001', '5.0', 'Comercial', '{Layout, Exhibición}', 'Planogramas y guías de exhibición de productos.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Protocolo de Atención al Cliente', 'COM-002', '2.1', 'Comercial', '{Ventas, Servicio}', 'Estándares de saludo, asesoramiento y resolución de quejas.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Política de Devoluciones y Garantías', 'COM-003', '3.0', 'Comercial', '{Posventa, Cambios}', 'Condiciones para cambios de productos y plazos legales.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Guía de Promociones y Descuentos Vigentes', 'COM-004', '1.1', 'Comercial', '{Marketing, Precios}', 'Aplicación de ofertas bancarias y cupones de descuento.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Procedimiento de Marcado de Precios y POP', 'COM-005', '2.2', 'Comercial', '{Precios, Cartelería}', 'Aseguramiento de la concordancia entre góndola y sistema.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');

-- ÁREA: OPERACIONES
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Norma de Control de Inventario Cíclico', 'OPS-001', '4.0', 'Operaciones', '{Stock, Depósito}', 'Metodología de conteo diario para evitar quiebres de stock.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Recepción de Mercadería de Proveedores', 'OPS-002', '2.5', 'Operaciones', '{Logística, Calidad}', 'Control de remitos, temperatura y estado de envases.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Gestión de Mermas y Desperdicios', 'OPS-003', '3.2', 'Operaciones', '{Pérdidas, Merma}', 'Registro y disposición final de productos no aptos para venta.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Manual de Limpieza y Mantenimiento de Tienda', 'OPS-004', '1.0', 'Operaciones', '{Higiene, Sucursal}', 'Cronograma de tareas para garantizar la salubridad del local.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Protocolo de Apertura y Cierre de Sucursal', 'OPS-005', '2.0', 'Operaciones', '{Tienda, Seguridad}', 'Checklist diario de habilitación de alarmas y luces.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');

-- ÁREA: CAPITAL HUMANO
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Reglamento de Licencias y Vacaciones', 'RRHH-001', '3.3', 'Capital Humano', '{Personal, Legales}', 'Procedimiento de solicitud de días y normativa de ley 20.744.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Plan de Capacitación y Desarrollo', 'RRHH-002', '1.5', 'Capital Humano', '{Carrera, Formación}', 'Programas de entrenamiento interno y subvenciones externas.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Política de Evaluación de Desempeño', 'RRHH-003', '2.0', 'Capital Humano', '{KPI, Feedback}', 'Ciclo anual de objetivos y bonos por cumplimiento.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Gestión de Ausentismo y Salud Ocupacional', 'RRHH-004', '4.2', 'Capital Humano', '{ART, Médicos}', 'Comunicación de partes médicos y visitas a domicilio.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Protocolo de Prevención de Acoso y Discriminación', 'RRHH-005', '1.0', 'Capital Humano', '{Diversidad, Clima}', 'Canal de denuncia anónimo y medidas disciplinarias.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');

-- ÁREA: SISTEMAS
INSERT INTO documents (title, code, version, area, tags, description, status, file_url, created_by)
VALUES 
('Política de Contraseñas y Accesos', 'SIS-001', '6.0', 'Sistemas', '{Seguridad, Ciber}', 'Requisitos de complejidad y frecuencia de rotación de claves.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Uso Aceptable de Herramientas Tecnológicas', 'SIS-002', '3.1', 'Sistemas', '{Internet, Laptop}', 'Normativa de uso de correo, redes sociales y equipamiento.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Plan de Continuidad Operativa (DRP)', 'SIS-003', '2.2', 'Sistemas', '{Backup, Desastre}', 'Procedimientos ante caída de servidores o red de tiendas.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Manual de Soporte Técnico y Help Desk', 'SIS-004', '1.8', 'Sistemas', '{Mesa Ayuda, Tickets}', 'Tiempos de respuesta (SLA) para incidentes en punto de venta.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab'),
('Gestión de Respaldo de Datos (Backups)', 'SIS-005', '4.0', 'Sistemas', '{Datos, Nube}', 'Frecuencia de copias de seguridad de bases de datos de ventas.', 'published', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'a1b2c3d4-e5f6-4a1b-8c2d-1234567890ab');
