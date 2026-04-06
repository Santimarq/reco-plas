// Configuración de WordPress Headless + WooCommerce
const WP_URL = import.meta.env.WOO_URL || 'https://reco-plas-productos.webdemuestra.site';
const WC_API = `${WP_URL}/wp-json/wc/v3`;
const WP_API = `${WP_URL}/wp-json/wp/v2`;

const WC_KEY = import.meta.env.WOO_CONSUMER_KEY || '';
const WC_SECRET = import.meta.env.WOO_CONSUMER_SECRET || '';

// Auth por query params (funciona con HTTP y HTTPS en WooCommerce)
function wooUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${WC_API}/${endpoint}`);
  url.searchParams.set('consumer_key', WC_KEY);
  url.searchParams.set('consumer_secret', WC_SECRET);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

// Tipos
export interface Producto {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
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

// Obtener todos los productos
export async function getProductos(params: Record<string, string> = {}): Promise<Producto[]> {
  try {
    const response = await fetch(wooUrl('products', { per_page: '100', ...params }));
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
    const response = await fetch(wooUrl(`products/${id}`));
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
    const response = await fetch(wooUrl('products/categories', { per_page: '100' }));
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

// Crear pedido en WooCommerce
export interface OrderLineItem {
  product_id: number;
  quantity: number;
}

export interface OrderData {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company?: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: OrderLineItem[];
  payment_method: string;
  payment_method_title: string;
  customer_note?: string;
  meta_data?: { key: string; value: string }[];
}

export interface OrderResult {
  id: number;
  number: string;
  status: string;
  total: string;
}

export async function createOrder(orderData: OrderData): Promise<OrderResult> {
  const response = await fetch(wooUrl('orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...orderData,
      set_paid: false,
      status: 'on-hold',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error creando orden: ${response.status} - ${error}`);
  }

  const order = await response.json();
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    total: order.total,
  };
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
