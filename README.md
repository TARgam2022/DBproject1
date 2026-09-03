# NextCommerce — Plantilla de eCommerce para Next.js

Plantilla de comercio electrónico moderna y gratuita construida con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Redux Toolkit** y una base de datos **MySQL** accedida a través de **mysql2** (compatible con despliegue serverless en Vercel). Incluye autenticación propia (JWT + bcrypt), panel de usuario con perfil y foto, carrito de compras, órdenes, gestión de productos para administradores, blogs y testimonios.

> Este proyecto es una versión ligera del boilerplate **NextMerce**, a la que se le ha integrado una capa completa de backend (**MySQL + API Routes**) y se le han eliminado todos los componentes, rutas y recursos que no se utilizan. La base de datos se crea y rellena automáticamente al primer uso.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Rutas / Páginas](#rutas--páginas)
6. [Arquitectura del backend (API Routes)](#arquitectura-del-backend-api-routes)
7. [Autenticación (JWT + bcrypt)](#autenticación-jwt--bcrypt)
8. [Base de datos (MySQL)](#base-de-datos-mysql)
   - [El motor de base de datos (clases y pool)](#el-motor-de-base-de-datos-clases-y-pool)
   - [Entidades y atributos de cada tabla](#entidades-y-atributos-de-cada-tabla)
   - [Relaciones entre tablas](#relaciones-entre-tablas)
   - [Autocreación, migraciones y seed automático](#autocreación-migraciones-y-seed-automático)
9. [Roles de usuario: user vs admin](#roles-de-usuario-user-vs-admin)
10. [Variables de entorno](#variables-de-entorno)
11. [Despliegue en Vercel](#despliegue-en-vercel)
12. [Despliegue local / servidor propio](#despliegue-local--servidor-propio)
13. [Comandos útiles](#comandos-útiles)

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.1.6 (App Router, Turbopack) | Framework React, rutas y API Routes |
| **React** | 19.2.0 | Librería de interfaz |
| **TypeScript** | 5.2.2 | Tipado estático |
| **Tailwind CSS** | 3.3.3 | Estilos y diseño |
| **Redux Toolkit** | 2.6.1 | Estado global (carrito, wishlist, etc.) |
| **MySQL** | 8.x | Base de datos relacional |
| **mysql2** | 3.24.3 | Cliente de conexión a MySQL (promise/pool) |
| **bcryptjs** | 3.0.3 | Hashing de contraseñas |
| **jose** | 6.2.10 | Firma y verificación de JWT |
| **swiper** | 10.2.0 | Carruseles (hero, etc.) |
| **react-hot-toast** | 2.4.1 | Notificaciones |

---

## Requisitos previos

- **Node.js** 20.9 o superior (recomendado 22+ para Next.js 16).
- **npm** (o tu gestor de paquetes preferido: yarn, pnpm).
- Sistema operativo: Windows, macOS o Linux (el proyecto se ha desarrollado en Windows).
- Una base de datos **MySQL 8.x** accesible (local, Docker, o un servicio en la nube como PlanetScale, Railway, Aiven, etc.). Ver [Variables de entorno](#variables-de-entorno).

---

## Instalación y puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
#    Copia el archivo de ejemplo a .env y completa tus credenciales MySQL:
cp .env.example .env
#    (en Windows: copy .env.example .env)

# 3. Arrancar en modo desarrollo
npm run dev
#   → http://localhost:3000
```

Otros modos:

```bash
npm run build   # Compilación de producción
npm run start   # Servir la build de producción
npm run lint    # Lint de Next.js (eslint)
```

**Nota sobre la base de datos:** el backend se conecta a MySQL usando el `DATABASE_URL` (o las variables `DB_*`). En la primera ejecución crea automáticamente las **tablas** (`CREATE TABLE IF NOT EXISTS`), aplica **migraciones** y rellena los **datos de ejemplo** desde `data/seeds/*.sql` en una única conexión con bloqueo (advisory lock) para evitar duplicados en entornos serverless. También crea una **cuenta de administrador** por defecto (ver [Roles de usuario](#roles-de-usuario-user-vs-admin)).

---

## Estructura del proyecto

```
.
├── data/                      # Semillas SQL (datos de ejemplo)
│   └── seeds/                 # Utilizadas para rellenar MySQL en el primer arranque
│       ├── products.sql
│       ├── blogs.sql
│       ├── categories.sql
│       └── testimonials.sql
│
├── public/
│   └── images/                # Recursos estáticos (productos, blog, etc.)
│
└── src/
    ├── app/                   # App Router
    │   ├── (site)/            # Grupo de rutas de la tienda
    │   │   ├── page.tsx       # Página de inicio
    │   │   ├── blogs/         # Detalle de blog
    │   │   └── (pages)/       # Cart, Checkout, MyAccount, Shop, etc.
    │   ├── api/               # Backend (API Routes)
    │   │   ├── auth/          # login, register, logout, me, profile
    │   │   ├── products/      # GET/POST y /[id] (GET/PUT/DELETE)
    │   │   ├── cart/          # Carrito
    │   │   ├── orders/        # Órdenes
    │   │   ├── blogs/         # Blogs
    │   │   ├── categories/    # Categorías
    │   │   └── testimonials/  # Testimonios
    │   └── context/           # AuthContext (proveedor de autenticación)
    │
    ├── components/            # Componentes React organizados por área
    │   ├── Header/            # Navbar (menú + pfp de usuario)
    │   ├── Footer/
    │   ├── Home/              # Hero, NewArrivals, BestSeller
    │   ├── MyAccount/         # Panel de usuario (cuenta + administración)
    │   ├── Orders/            # Listado/detalle de órdenes
    │   ├── Cart/              # Carrito
    │   ├── Checkout/          # Proceso de pago
    │   ├── Wishlist/
    │   ├── Shop/              # Tarjetas de producto
    │   ├── ShopWithSidebar/
    │   ├── ShopWithoutSidebar/
    │   ├── ShopDetails/       # Detalle de producto
    │   ├── Blog/              # Componentes compartidos del blog
    │   ├── BlogDetails/       # Detalle de post
    │   └── Common/            # Utilidades (ProductImage, Breadcrumb, etc.)
    │
    ├── db/                    # Capa de acceso a datos (MySQL)
    │   ├── mysql.ts           # Pool de conexiones + helpers query/execute
    │   ├── base-db.ts         # Clase base BaseDB (init, seed con lock)
    │   ├── user-db.ts         # UserDB (users, carts, orders)
    │   ├── product-db.ts      # ProductDB
    │   ├── blog-db.ts         # BlogDB
    │   ├── category-db.ts     # CategoryDB
    │   └── testimonial-db.ts  # TestimonialDB
    │
    ├── lib/                   # Helpers de autenticación
    │   └── auth.ts            # hash/compare password, JWT, cookie
    │
    ├── hooks/                 # Hooks personalizados
    │   └── useApiData.ts      # Fetch declarativo de datos
    │
    ├── redux/                 # Store de Redux Toolkit
    ├── types/                 # Tipos de TypeScript (Product, etc.)
    └── styles/                # Estilos globales
```

---

## Rutas / Páginas

| Ruta | Descripción | Tipo |
|---|---|---|
| `/` | Página de inicio (hero dinámico, novedades, más vendidos) | Estática |
| `/shop-with-sidebar` | Tienda con barra lateral | Estática |
| `/shop-without-sidebar` | Tienda sin barra lateral | Estática |
| `/shop-details` | Detalle de producto / vista rápida | Estática |
| `/wishlist` | Lista de deseos | Estática |
| `/cart` | Carrito de compras | Estática |
| `/checkout` | Proceso de pago | Estática |
| `/signin` | Inicio de sesión | Estática |
| `/signup` | Registro de cuenta | Estática |
| `/my-account` | Redirige a `/my-account/orders` | Redirección |
| `/my-account/[tab]` | Panel de usuario (orders, account-details, add-product, product-list, edit-product) | Dinámica |
| `/blogs/blog-details` | Detalle de post de blog | Estática |
| `/blogs/blog-details-with-sidebar` | Detalle de post con barra | Estática |
| `/contact` | Página de contacto | Estática |
| `/error` | Página de error | Estática |
| `/mail-success` | Confirmación de envío | Estática |

> **Nota de limpieza:** se eliminaron las rutas no enlazadas `/blogs/blog-grid`, `/blogs/blog-grid-with-sidebar`, así como sus componentes huérfanos y numerosos componentes/recursos muertos para reducir el tamaño final.

---

## Arquitectura del backend (API Routes)

El backend está implementado con **API Routes** de Next.js (archivos `route.ts` dentro de `src/app/api/`). Cada archivo exporta funciones `GET`, `POST`, `PUT` o `DELETE` según el método HTTP que maneja. El modelo es una API REST que lee y escribe en la base de datos **MySQL** a través de las clases `*DB` de `src/db/`.

### Mapa de endpoints

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Crea una cuenta y devuelve un JWT en cookie |
| `POST` | `/api/auth/login` | No | Inicia sesión y devuelve un JWT en cookie |
| `POST` | `/api/auth/logout` | No | Cierra sesión y borra la cookie |
| `GET` | `/api/auth/me` | Cookie (opcional) | Devuelve el usuario actual o `null` |
| `PUT` | `/api/auth/profile` | Sí (JWT) | Actualiza nombre y foto de perfil |
| `POST` | `/api/auth/profile` | Sí (JWT) | Cambia la contraseña |
| `GET` | `/api/products` | No | Lista todos los productos |
| `POST` | `/api/products` | Sí (admin) | Crea un producto nuevo |
| `GET` | `/api/products/:id` | No | Obtiene un producto por id |
| `PUT` | `/api/products/:id` | Sí (admin) | Actualiza un producto |
| `DELETE` | `/api/products/:id` | Sí (admin) | Elimina un producto |
| `GET` | `/api/cart` | Cookie (opcional) | Lista el carrito del usuario |
| `POST` | `/api/cart` | Sí (JWT) | Guarda el carrito del usuario |
| `GET` | `/api/orders` | Sí (JWT) | Lista las órdenes del usuario |
| `POST` | `/api/orders` | Sí (JWT) | Crea una orden y vacía el carrito |
| `GET` | `/api/blogs` | No | Lista los posts del blog |
| `GET` | `/api/categories` | No | Lista las categorías |
| `POST` | `/api/categories` | No | Añade una categoría |
| `GET` | `/api/testimonials` | No | Lista los testimonios |

### Flujo del frontend → backend

1. Los componentes de cliente llaman a `useApiData(url, key)` (hook en `src/hooks/useApiData.ts`) que hace `fetch` del endpoint y extrae el array de la respuesta usando la clave indicada (p. ej. `"products"`, `"orders"`, `"blogs"`).
2. Las acciones de escritura (login, registro, perfil, productos, órdenes, carrito) usan `fetch` con el método correspondiente y envían el cuerpo en JSON.
3. El estado de autenticación se centraliza en `AuthContext` (ver sección siguiente), que expone `user`, `loading`, `login`, `register`, `logout` y `refreshUser`.

---

## Autenticación (JWT + bcrypt)

La autenticación es **propia** (no usa next-auth para el login del sitio). Todo está centralizado en `src/lib/auth.ts` y `src/app/context/AuthContext.tsx`.

### Cómo funciona

1. **Registro** (`POST /api/auth/register`):
   - Valida que `name`, `email` y `password` estén presentes.
   - Valida el formato del email mediante regex.
   - Requiere contraseña de al menos 6 caracteres.
   - Comprueba que el email no esté ya registrado (409 en caso contrario).
   - Encripta la contraseña con `bcryptjs` (`hashPassword`) y crea el usuario.
   - Genera un **JWT** firmado con `jose` (`createToken`) y lo guarda en una **cookie httpOnly**.

2. **Login** (`POST /api/auth/login`):
   - Busca al usuario por email.
   - Compara la contraseña con `bcryptjs` (`comparePassword`).
   - Si es correcta, genera el JWT y lo guarda en la cookie.

3. **Cookie**:
   - Nombre: `auth_token` (constante `AUTH_COOKIE_NAME`).
   - Flags: `httpOnly: true`, `sameSite: "lax"`, `secure: true` solo en producción, `path: "/"`, caducidad de **7 días**.

4. **Verificación** (`GET /api/auth/me` y en cada endpoint protegido):
   - Se lee la cookie, se verifica el token con `verifyToken` (misma clave `AUTH_SECRET`).
   - Si es válido, se obtiene el usuario por `id` y se devuelven sus datos.
   - Si no hay token o es inválido, se devuelve `user: null`.

5. **`AuthContext`**:
   - Al montar la app, hace una única petición a `/api/auth/me` para restaurar la sesión.
   - Expone `user`, `login()`, `register()`, `logout()` y `refreshUser()`.
   - El tipo `User` es:
     ```ts
     type User = {
       id: number;
       name: string;
       email: string;
       role: "user" | "admin";
       image?: string | null;   // foto de perfil (base64/data URL)
     };
     ```

### Protección de rutas de administrador

Los endpoints de escritura de productos comprueban el rol del token. Si el token no existe → `401 Unauthorized`; si el usuario autenticado **no es admin** → `403 Forbidden`. En el frontend, las pestañas "Manage Products" y "Add Product" solo se muestran si `user.role === "admin"`.

### Perfil del usuario (`/api/auth/profile`)

- **PUT** actualiza `name` y/o `image`. La imagen se almacena como **data URL en base64** en la columna `users.image` (no se sube ningún archivo al servidor). Los datos `image` vacíos se guardan como `null`.
- **POST** cambia la contraseña: recibe la contraseña antigua, la valida y, si es correcta, guarda una nueva encriptada.

---

## Base de datos (MySQL)

### El motor de base de datos (clases y pool)

Toda la persistencia se apoya en **MySQL 8.x** accedido mediante **mysql2/promise**. El proyecto usa **una única base de datos** con varias tablas. La arquitectura se divide en:

- **`src/db/mysql.ts`** — crea el **pool de conexiones** (singleton) a partir de las variables de entorno y expone los helpers `query()` (no preparado, para DDL) y `execute()` (preparado, para consultas con `?`).
- **`src/db/base-db.ts`** — clase base **`BaseDB`** que ofrece los métodos que usan las clases hijas:
  ```ts
  abstract class BaseDB {
    protected abstract tableName: string;
    protected run(sql, params): Promise<ResultSetHeader>  // INSERT/UPDATE/DELETE (devuelve insertId)
    protected all<T>(sql, params): Promise<T[]>            // SELECT
    protected ddl(sql)                                     // CREATE/ALTER
    protected count(table): Promise<number>
    protected columnExists(table, column): Promise<boolean>
    protected seedFromFile(table, seedPath)                // seed seguro con advisory lock
  }
  ```
- **Clases hija** (por dominio): `UserDB`, `ProductDB`, `BlogDB`, `CategoryDB`, `TestimonialDB`.

Características clave:

- Se utiliza el patrón **singleton** (`getInstance()`) y un **pool de conexiones** reutilizable entre invocaciones (óptimo para serverless/Vercel).
- Las consultas parametrizadas usan **prepared statements** (`?`) para evitar inyección SQL.
- `run()` devuelve el `ResultSetHeader` (con `insertId`) para leer el id de la fila recién insertada.
- En el `init()` de cada clase se ejecuta el **DDL** y, si la tabla está vacía, se **siembran datos de ejemplo** desde `data/seeds/*.sql` dentro de una transacción protegida por un **advisory lock** (`GET_LOCK`), evitando duplicados cuando varias instancias serverless arrancan a la vez.

---

### Entidades y atributos de cada tabla

A continuación se documentan **todas** las tablas, con sus columnas, tipos MySQL y descripción. Todas viven en **una única base de datos** y se crean automáticamente al primer uso:

```sql
-- Esquema resumen
CREATE TABLE IF NOT EXISTS users       (...);
CREATE TABLE IF NOT EXISTS carts       (...);
CREATE TABLE IF NOT EXISTS orders      (...);
CREATE TABLE IF NOT EXISTS products    (...);
CREATE TABLE IF NOT EXISTS blogs       (...);
CREATE TABLE IF NOT EXISTS categories  (...);
CREATE TABLE IF NOT EXISTS testimonials(...);
```

#### 1. Tabla `users` — Usuarios

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `name` | `VARCHAR(255)` | NOT NULL | Nombre del usuario |
| `email` | `VARCHAR(255)` | NOT NULL UNIQUE | Email (se normaliza a minúsculas) |
| `password` | `VARCHAR(255)` | NOT NULL | Hash bcrypt de la contraseña |
| `role` | `VARCHAR(20)` | NOT NULL DEFAULT `'user'` | Rol: `'user'` o `'admin'` |
| `image` | `LONGTEXT` | nullable | Foto de perfil (data URL base64) |
| `createdAt` | `TIMESTAMP` | NOT NULL DEFAULT `CURRENT_TIMESTAMP` | Fecha de creación |

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  image LONGTEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. Tabla `carts` — Carritos

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `userId` | `INT` | NOT NULL UNIQUE, FK lógica → `users(id)` | Usuario dueño del carrito |
| `items` | `LONGTEXT` | NOT NULL | Array JSON con los ítems del carrito |
| `updatedAt` | `TIMESTAMP` | NOT NULL DEFAULT `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Última actualización |

```sql
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  items LONGTEXT NOT NULL,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Los ítems se serializan como **JSON** dentro de `items`. La forma de cada ítem (`CartItemData`) es:

```ts
type CartItemData = {
  id: number;              // id del producto
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: { thumbnails: string[]; previews: string[] };
};
```

#### 3. Tabla `orders` — Órdenes

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `orderId` | `VARCHAR(64)` | NOT NULL UNIQUE | Código de orden público (ej. `ORD-...`) |
| `userId` | `INT` | NOT NULL, FK lógica → `users(id)` | Usuario que realiza la orden |
| `status` | `VARCHAR(50)` | NOT NULL DEFAULT `'processing'` | Estado de la orden |
| `total` | `DECIMAL(10,2)` | NOT NULL DEFAULT 0 | Total de la orden |
| `items` | `LONGTEXT` | NOT NULL | Array JSON con los productos comprados |
| `createdAt` | `TIMESTAMP` | NOT NULL DEFAULT `CURRENT_TIMESTAMP` | Fecha de creación |

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId VARCHAR(64) NOT NULL UNIQUE,
  userId INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'processing',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  items LONGTEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Forma de cada ítem dentro de `items` (subtipo de `Order["items"]`):

```ts
{
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}
```

#### 4. Tabla `products` — Productos

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `title` | `VARCHAR(255)` | NOT NULL | Título/nombre del producto |
| `reviews` | `INT` | NOT NULL DEFAULT 0 | Número de reseñas |
| `price` | `DECIMAL(10,2)` | NOT NULL DEFAULT 0 | Precio normal |
| `discountedPrice` | `DECIMAL(10,2)` | NOT NULL DEFAULT 0 | Precio con descuento |
| `thumbnail_1` | `TEXT` | nullable | Imagen miniatura principal |
| `thumbnail_2` | `TEXT` | nullable | Imagen miniatura secundaria |
| `preview_1` | `TEXT` | nullable | Imagen de vista previa principal |
| `preview_2` | `TEXT` | nullable | Imagen de vista previa secundaria |
| `categoryId` | `INT` | nullable | FK lógico → `categories(id)` |
| `description` | `TEXT` | nullable | Descripción del producto |

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  reviews INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discountedPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  thumbnail_1 TEXT,
  thumbnail_2 TEXT,
  preview_1 TEXT,
  preview_2 TEXT,
  categoryId INT,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

El tipo `Product` en `src/types/product.ts`:

```ts
type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  description?: string | null;
  categoryId?: number | null;
  imgs?: { thumbnails: string[]; previews: string[] };
};
```

#### 5. Tabla `blogs` — Posts del blog

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `date` | `VARCHAR(50)` | NOT NULL | Fecha del post |
| `views` | `INT` | NOT NULL DEFAULT 0 | Número de vistas |
| `title` | `VARCHAR(255)` | NOT NULL | Título del post |
| `img` | `TEXT` | nullable | Imagen de portada |

```sql
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  views INT NOT NULL DEFAULT 0,
  title VARCHAR(255) NOT NULL,
  img TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. Tabla `categories` — Categorías

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `title` | `VARCHAR(255)` | NOT NULL | Nombre de la categoría |
| `img` | `TEXT` | nullable | Imagen de la categoría |

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  img TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. Tabla `testimonials` — Testimonios

| Columna | Tipo SQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | `INT` | PRIMARY KEY AUTO_INCREMENT | Identificador único |
| `review` | `TEXT` | NOT NULL | Reseña del cliente |
| `authorName` | `VARCHAR(255)` | NOT NULL | Nombre del autor |
| `authorRole` | `VARCHAR(255)` | NOT NULL | Cargo/rol del autor |
| `authorImg` | `TEXT` | nullable | Foto del autor |

```sql
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review TEXT NOT NULL,
  authorName VARCHAR(255) NOT NULL,
  authorRole VARCHAR(255) NOT NULL,
  authorImg TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Relaciones entre tablas

El esquema usa **claves foráneas lógicas** (definidas a nivel de aplicación / SQL, sin importar Constraint en todos los casos):

- `carts.userId` → `users.id` (un usuario tiene **un** carrito; relación 1:1 — `userId` es UNIQUE).
- `orders.userId` → `users.id` (un usuario puede tener **muchas** órdenes; relación 1:N).
- `products.categoryId` → `categories.id` (relación lógica 1:N; **no** se define CONSTRAINT de FK en el DDL, solo se usa el id para agrupar).

```
users 1 ──── 1 carts
users 1 ──── N orders
categories 1 ──── N products  (lógico)
```

> Los ítems del carrito y de las órdenes se guardan como **JSON** dentro de una columna `LONGTEXT`, por lo que no existen tablas puente `cart_items` ni `order_items`. Esto simplifica el modelo manteniendo los datos anidados.

---

### Autocreación, migraciones y seed automático

Al desplegar sobre MySQL, las tablas pueden ser nuevas o contener esquemas de una versión anterior. Para mantenerlo simple y seguro, cada clase implementa dentro de `init()`:

- **Autocreación de tablas** con `CREATE TABLE IF NOT EXISTS` (idempotente).
- **Migraciones de columnas** mediante consultas a `INFORMATION_SCHEMA.COLUMNS` (vía `columnExists()`):
  - `users`: si no existe la columna `image`, ejecuta `ALTER TABLE users ADD COLUMN image LONGTEXT`.
  - `products`: si no existe la columna `description`, ejecuta `ALTER TABLE products ADD COLUMN description TEXT`.
- **Seed automático**: si la tabla está vacía, carga `data/seeds/*.sql`. Para evitar filas duplicadas cuando varias instancias serverless de Vercel arrancan a la vez, el seed se ejecuta dentro de un **advisory lock** de MySQL (`GET_LOCK`/`RELEASE_LOCK`) nombrado por tabla. El admin por defecto se inserta con `INSERT ... ON DUPLICATE` / manejo de `ER_DUP_ENTRY` (ver [Roles](#roles-de-usuario-user-vs-admin)).

Este diseño permite añadir campos nuevos sin romper bases preexistentes y garantiza que los datos de ejemplo solo se carguen una vez.

---

## Roles de usuario: user vs admin

El campo `role` de la tabla `users` determina los permisos:

| Rol | Permisos |
|---|---|
| `user` | Ver productos, gestionar su carrito, crear y ver sus órdenes, actualizar su perfil/imagen y contraseña. |
| `admin` | Todo lo del rol `user` + crear, editar y eliminar productos desde el panel (`/my-account/product-list`, `/my-account/add-product`, `/my-account/edit-product`). |

**Cuenta admin por defecto** (se crea automáticamente al inicializar la DB si no existe ningún admin):

```
Email:    admin@company.com
Password: admin123
```

Para crearla, el código en `init()` cuenta los usuarios con `role = 'admin'` y, si son 0, inserta este usuario con la contraseña hasheada. **(Cambia esta contraseña antes de publicar en producción.)**

---

## Variables de entorno

Parte del archivo `.env.example` a la raíz como `.env` y complétalo con tus credenciales MySQL.

```env
# Clave secreta para firmar/verificar los JWT.
# Si no se define, se usa el fallback "dev-secret-change-me-in-production".
AUTH_SECRET=una-clave-muy-segura-y-larga

# Opción A: URL de conexión a MySQL
DATABASE_URL=mysql://usuario:clave@host:3306/nombre_bd

# Opción B: credenciales por separado (alternativa a DATABASE_URL)
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=tu_clave
# DB_NAME=nextcommerce

# SSL (requerido por muchos proveedores en la nube)
# DB_SSL=true        # o añade ?ssl=true al final de DATABASE_URL

# Pool de conexiones (opcional)
# DB_POOL_LIMIT=5
```

Otras variables:

- `NODE_ENV` (gestionada automáticamente por Next.js): controla que la cookie JWT use `secure: true` solo en producción.
- Si se define tanto `DATABASE_URL` como `DB_*`, **`DATABASE_URL` tiene prioridad**.
- En producción, si no hay configuración de base de datos, la app lanza un error claro en lugar de arrancar con datos falsos.

---

## Comandos útiles

```bash
# Desarrollo (con recarga en caliente)
npm run dev

# Compilar para producción
npm run build

# Servir la build de producción
npm run start

# Lint / revisión de estilo
npm run lint
```

---

## Despliegue en Vercel

El proyecto está listo para **Vercel** (serverless). Gracias a la migración a **MySQL**, los datos se persisten de verdad: crear productos, registrarse, hacer pedidos, guardar el carrito, etc. no se pierden entre peticiones. La base SQLite original **no** podía persistir en serverless (sistema de archivos efímero y de solo lectura), por eso se migró.

### 1. Crea/elige tu base de datos MySQL

Necesitas un MySQL 8.x accesible por red. Opciones habituales compatibles con Vercel:

- **PlanetScale** (MySQL serverless).
- **Railway**, **Aiven**, **Clever Cloud** (MySQL gestionado).
- Un VPS propio con MySQL expuesto (abre el puerto 3306).

Anota la **URL de conexión**. La mayoría incluye SSL:
`mysql://USUARIO:CLAVE@HOST:3306/NOMBRE_BD?ssl=true`

> La app crea las tablas y siembra los datos automáticamente a la primera petición; no tienes que importar el esquema a mano. Solo asegúrate de que el usuario de MySQL tenga permisos de `CREATE`, `ALTER`, `INSERT`, `SELECT`, `UPDATE` y `DELETE`, y que el `DATABASE_URL` apunte a una base que ya exista (o con permisos para crearla).

### 2. Sube el repositorio a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

Los archivos `data/seeds/*.sql` **sí** se suben (son los datos de ejemplo). Los `.sqlite` antiguos están ignorados en `.gitignore` y ya no se usan.

### 3. Importa el proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) → **New Project** → selecciona el repositorio.
2. Vercel detecta **Next.js** automáticamente (framework preset `Next.js`).
3. En la pestaña **Environment Variables** añade:

| Nombre | Valor |
|---|---|
| `DATABASE_URL` | `mysql://tu_usuario:tu_clave@host:3306/tu_bd?ssl=true` |
| `AUTH_SECRET` | Una clave aleatoria larga |

> Alternativa: en lugar de `DATABASE_URL` puedes definir `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_SSL=true`.
> Genera una clave con: `openssl rand -base64 32` (o `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

4. **Deploy** → espera a que la build termine.

### 4. Verifica

- Abre la URL de producción y navega hasta `/my-account` → **Add Product** (inicia sesión con el **admin**).
- Crea un producto: debería aparecer en la tienda y **persistir** al recargar.
- Regístrate con un usuario nuevo, añade al carrito y haz un **checkout**: la orden debería verse en *Orders*.

**Cuenta admin por defecto:**

```
Email:    admin@company.com
Password: admin123
```

> ⚠️ Cambia la contraseña del admin y la `AUTH_SECRET` inmediatamente después del primer despliegue.

### Notas para Vercel/MySQL

- **Pool de conexiones**: usa `DB_POOL_LIMIT` (por defecto 5) para controlar conexiones concurrentes; muchos planes gratuitos limitan el nº de conexiones simultáneas.
- **IPv6**: algunos proveedores solo ofrecen IPv4 o IPv6; si falla la conexión, revisa el endpoint del proveedor.
- **SSL**: si el proveedor exige TLS, añade `?ssl=true` a `DATABASE_URL` o `DB_SSL=true`.

---

## Despliegue local / servidor propio

1. Asegúrate de tener MySQL 8.x corriendo y una base creada.
2. Crea `.env` a partir de `.env.example` y configura `DATABASE_URL` o las variables `DB_*`.
3. Instala dependencias y arranca:
   ```bash
   npm install
   npm run build
   npm start   # o npm run dev en desarrollo
   ```
4. En la primera petición se crearán las tablas, se aplicarán migraciones y se sembrarán los datos de ejemplo.

---

## Notas de producción

1. **Cambia `AUTH_SECRET`** y la **contraseña del admin** antes de desplegar.
2. La app usa **MySQL** (vía `mysql2`/pool), por lo que es totalmente compatible con entornos **serverless** como Vercel: los datos persisten de forma fiable.
3. Las **fotos de perfil** se guardan como data URL base64 en la columna `users.image`; para grandes volúmenes de usuarios conviene migrar a almacenamiento de archivos/objetos (S3, etc.) y guardar la URL.
4. Las **fotos/URLs de productos** (columnas de imagen) pueden ser rutas internas de `/images/...` o URLs externas; el componente `ProductImage` gestiona ambos casos.
5. El proyecto elimina deliberadamente componentes, rutas y recursos no utilizados para reducir el tamaño de la build final.
