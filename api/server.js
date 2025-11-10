// api/server.js
// NO necesitamos 'express' ni 'cors'. Vercel maneja esto.

// ¡IMPORTANTE! Lee la clave secreta desde las "Environment Variables"
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Esta es la función serverless
module.exports = async (req, res) => {
  
  // Vercel te deja configurar CORS en un archivo 'vercel.json'
  // pero para 'vercel dev' (localhost) a veces hay que ponerlo manual.
  // Esto permite que tu frontend en localhost:3000 hable con la API
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // El navegador envía una petición "pre-flight" OPTIONS antes del POST.
  // Solo le decimos "OK, sí tienes permiso".
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Si es un POST, creamos el pago
  if (req.method === 'POST') {
    try {
      // El cuerpo (body) ya viene parseado por Vercel
      const { promoId } = req.body;
      let amount;

      if (promoId === 'apartado-500') {
        amount = 1; // $500.00 MXN
      } else {
        return res.status(400).json({ error: 'Promo no válida' });
      }

      // Crea el Intento de Pago
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'mxn',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Envía el client_secret de vuelta al frontend
      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Si es GET o cualquier otra cosa, 404
  return res.status(404).send('Ruta no encontrada.');
};
