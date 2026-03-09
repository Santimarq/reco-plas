// Configuración de WordPress Headless
// Cambiar esta URL por tu dominio de WordPress
const WP_URL = import.meta.env.WP_URL || 'https://reco-plas.webdemuestra.site';

// API REST de WooCommerce
const WC_API = `${WP_URL}/wp-json/wc/v3`;

// API REST de WordPress
const WP_API = `${WP_URL}/wp-json/wp/v2`;

// Credenciales de WooCommerce (configurar en .env)
const WC_KEY = import.meta.env.WC_CONSUMER_KEY || '';
const WC_SECRET = import.meta.env.WC_CONSUMER_SECRET || '';

// Headers de autenticación para WooCommerce
function getWooHeaders() {
  const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  return {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

// Tipos básicos
export interface Producto {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  stock_status: string;
  attributes: { name: string; options: string[] }[];
}

export interface Categoria {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string } | null;
  count: number;
}

export interface Pagina {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
}

// Obtener todos los productos
export async function getProductos(params: Record<string, string> = {}): Promise<Producto[]> {
  const searchParams = new URLSearchParams({ per_page: '100', ...params });

  try {
    const response = await fetch(`${WC_API}/products?${searchParams}`, {
      headers: WC_KEY ? getWooHeaders() : {},
    });

    if (!response.ok) {
      console.error('Error fetching productos:', response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Obtener un producto por slug
export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const productos = await getProductos({ slug });
  return productos[0] || null;
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<Producto | null> {
  try {
    const response = await fetch(`${WC_API}/products/${id}`, {
      headers: WC_KEY ? getWooHeaders() : {},
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Obtener categorías de productos
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const response = await fetch(`${WC_API}/products/categories?per_page=100`, {
      headers: WC_KEY ? getWooHeaders() : {},
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Obtener productos por categoría
export async function getProductosByCategoria(categoriaId: number): Promise<Producto[]> {
  return getProductos({ category: categoriaId.toString() });
}

// Obtener página por slug
export async function getPagina(slug: string): Promise<Pagina | null> {
  try {
    const response = await fetch(`${WP_API}/pages?slug=${slug}`);
    const paginas = await response.json();
    return paginas[0] || null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Obtener menú de navegación (si usas el plugin de menús REST)
export async function getMenu(location: string = 'primary') {
  try {
    const response = await fetch(`${WP_URL}/wp-json/menus/v1/locations/${location}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Formatear precio en pesos argentinos
export function formatPrice(price: string | number): string {
  const numero = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(numero);
}
