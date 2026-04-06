import type { APIRoute } from 'astro';
import { createOrder } from '../../lib/wordpress';
import type { OrderLineItem } from '../../lib/wordpress';

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nombre, apellido, email, telefono, empresa, cuit, direccion, ciudad, provincia, cp, notas, cart } = body;

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !telefono) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lineItems: OrderLineItem[] = (cart as CartItem[]).map((item) => ({
      product_id: item.id,
      quantity: item.cantidad,
    }));

    const metaData: { key: string; value: string }[] = [];
    if (cuit) metaData.push({ key: 'CUIT', value: cuit });

    const order = await createOrder({
      billing: {
        first_name: nombre,
        last_name: apellido,
        email,
        phone: telefono,
        company: empresa || '',
        address_1: '',
        city: '',
        state: '',
        postcode: '',
        country: 'AR',
      },
      shipping: {
        first_name: nombre,
        last_name: apellido,
        address_1: '',
        city: '',
        state: '',
        postcode: '',
        country: 'AR',
      },
      line_items: lineItems,
      payment_method: 'bacs',
      payment_method_title: 'Transferencia bancaria',
      customer_note: notas || '',
      meta_data: metaData.length > 0 ? metaData : undefined,
    });

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      order_number: order.number,
      total: order.total,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return new Response(JSON.stringify({
      error: error?.message || 'Error al procesar el pedido. Intenta de nuevo.',
      details: String(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
