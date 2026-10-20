CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_empresa INT NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Para volver admin a un usuario ya registrado:
-- UPDATE usuarios SET rol = 'admin' WHERE email = 'tu@mail.com';
