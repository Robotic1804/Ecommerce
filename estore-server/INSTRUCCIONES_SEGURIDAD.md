# 🔒 Instrucciones de Configuración y Seguridad

## ✅ Correcciones Aplicadas

Se han corregido **TODAS** las vulnerabilidades críticas de seguridad en el proyecto:

### 1. ✅ SQL Injection - CORREGIDO
- **users.js**: Login ahora usa queries parametrizados
- **product.js**: Búsqueda de productos y por ID ahora son seguras
- **orders.js**: Todas las operaciones de órdenes usan queries parametrizados

### 2. ✅ Secretos Hardcodeados - CORREGIDO
- El secreto JWT ahora se carga desde variables de entorno
- Se crearon archivos `.env` y `.env.example` para configuración

### 3. ✅ Validación de Entrada - AGREGADA
- Validación en endpoints de login
- Validación en creación de órdenes
- Validación en búsqueda de productos por ID
- Validación en consulta de órdenes

### 4. ✅ Dependencias - CORREGIDAS
- Se agregó `body-parser` a `package.json`

---

## 📋 Pasos Siguientes (IMPORTANTE)

### 1. Instalar Dependencias
```bash
cd estore-server
npm install
```

### 2. Configurar Base de Datos

Edita el archivo `.env` con tus credenciales reales de MySQL:

```env
DB_HOST=localhost          # Tu host de base de datos
DB_USER=tu_usuario         # Tu usuario de MySQL
DB_PASS=tu_contraseña      # Tu contraseña de MySQL
DB_NAME=estore_db          # Nombre de tu base de datos
DB_PORT=3306               # Puerto de MySQL
```

### 3. IMPORTANTE: Cambiar JWT_SECRET

**ANTES DE PRODUCCIÓN**, genera una clave JWT segura:

```bash
# Opción 1: Generar una clave aleatoria en Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: Usar un generador online (desde sitios confiables)
```

Luego reemplaza en `.env`:
```env
JWT_SECRET=tu-clave-super-secreta-generada-aqui
```

### 4. Crear la Base de Datos

Necesitas crear las siguientes tablas en MySQL:

```sql
-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pin VARCHAR(10),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_category_id INT NULL,
  FOREIGN KEY (parent_category_id) REFERENCES categories(id)
);

-- Tabla de productos
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  product_img VARCHAR(255),
  category_id INT,
  price DECIMAL(10, 2),
  keywords TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabla de órdenes
CREATE TABLE orders (
  orderId INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  userName VARCHAR(200),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pin VARCHAR(10),
  total DECIMAL(10, 2),
  orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Tabla de detalles de orden
CREATE TABLE orderdetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(10, 2),
  amount DECIMAL(10, 2),
  FOREIGN KEY (orderId) REFERENCES orders(orderId),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

### 5. Iniciar el Servidor

```bash
npm start
# o
node index.js
```

El servidor debería iniciar en `http://localhost:5001`

---

## 🔐 Mejores Prácticas de Seguridad

### ✅ Ya Implementadas:
- Queries parametrizados (prevención de SQL injection)
- Validación de entrada en endpoints críticos
- Secretos en variables de entorno
- Hashing de contraseñas con bcryptjs
- Autenticación JWT

### 🔄 Recomendaciones Adicionales:

1. **Rate Limiting**: Instalar y configurar `express-rate-limit`
   ```bash
   npm install express-rate-limit
   ```

2. **Helmet.js**: Agregar headers de seguridad
   ```bash
   npm install helmet
   ```

3. **HTTPS**: En producción, usar siempre HTTPS

4. **Logs**: Implementar logging con `winston` o `morgan`

5. **Validación Avanzada**: Considerar usar `joi` o `express-validator`

---

## 📝 Cambios en el Response de Login

**IMPORTANTE**: El response de `/users/login` ahora incluye el `id` del usuario:

```json
{
  "token": "...",
  "expiresInSeconds": 3600,
  "user": {
    "id": 1,          // ← NUEVO: Ahora incluye el ID
    "firstName": "...",
    "lastName": "...",
    // ...
  }
}
```

Esto permite que el frontend pueda usar el `userId` en las operaciones de órdenes.

---

## 🚨 ANTES DE SUBIR A PRODUCCIÓN

- [ ] Cambiar `JWT_SECRET` por una clave segura generada
- [ ] Configurar variables de entorno de producción
- [ ] Habilitar HTTPS
- [ ] Configurar backup de base de datos
- [ ] Revisar permisos de usuario de base de datos
- [ ] Implementar rate limiting
- [ ] Agregar logging apropiado
- [ ] Probar todos los endpoints

---

## 📞 Soporte

Si encuentras algún problema, revisa:
1. Que todas las dependencias estén instaladas (`npm install`)
2. Que el archivo `.env` tenga las credenciales correctas
3. Que la base de datos esté corriendo
4. Que las tablas estén creadas correctamente

---

**Fecha de correcciones**: 2025-11-28
**Versión**: 1.1.0 (Segura)
