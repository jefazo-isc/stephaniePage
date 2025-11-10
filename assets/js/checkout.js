// assets/js/checkout.js
document.addEventListener('DOMContentLoaded', () => {

  // --- ¡IMPORTANTE! ---
  // Esta es tu clave PUBLICABLE de prueba
  const stripe = Stripe('pk_test_51SICj4E3tRmLuv8snjPN6su1r1XD2CoOhufLhdSXwZm6W5endnRQBXki3UeE612VTLuLTkTLRy7nuWRmxEbS7AHP00A3JVqIzE');

  // Elementos del DOM
  const modal = document.getElementById('payment-modal');
  const form = document.querySelector('.payment-form');
  const closeButton = document.querySelector('.modal-close');
  const allTriggerButtons = document.querySelectorAll('.cta-mostrar-form');

  // Validar que los elementos existen
  if (!modal || !form) {
    console.error('Error: No se encontró el modal o el formulario de pago');
    return;
  }

  const elementsContainer = form.querySelector('.payment-element');
  const placeholder = form.querySelector('.payment-element-placeholder');
  const submitButton = form.querySelector('.submit-button');
  const buttonText = form.querySelector('.button-text');
  const messageContainer = form.querySelector('.payment-message');

  let elements; // Variable para guardar la instancia de Stripe Elements
  let isInitialized = false;

  // Función para abrir el modal
  async function openModal() {
    console.log('Abriendo modal...');

    // Mostrar el modal con animación
    modal.style.display = 'flex';
    // Forzar reflow para que la animación funcione
    void modal.offsetWidth;
    modal.classList.add('show');

    // Si ya está inicializado, no hacer nada más
    if (isInitialized) {
      console.log('Modal ya inicializado, mostrando formulario existente');
      return;
    }

    // Marcar como inicializado
    isInitialized = true;

    console.log('Inicializando formulario de pago...');
    console.log('PromoId:', form.dataset.promoId);

    // Llamar al backend para obtener el clientSecret
    try {
      const response = await fetch('/api/server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoId: form.dataset.promoId }),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message || `Error del servidor: ${response.status}`);
      }

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      console.log('ClientSecret obtenido, montando Stripe Elements...');

      // Crear y montar el formulario de Stripe
      elements = stripe.elements({ clientSecret });
      const paymentElement = elements.create('payment');

      // Cuando el formulario real esté listo para mostrarse...
      paymentElement.on('ready', () => {
        console.log('Stripe Elements listo');
        // ...oculta el spinner
        if (placeholder) placeholder.style.display = 'none';
      });

      // Monta el formulario en el div
      paymentElement.mount(elementsContainer);

    } catch (e) {
      console.error('Error al inicializar el formulario:', e);
      if(placeholder) {
        placeholder.innerHTML = `<span style="color: red;">Error: ${e.message}</span>`;
      }
    }
  }

  // Función para cerrar el modal
  function closeModal() {
    modal.classList.remove('show');
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
    // Limpiar mensajes de error
    if (messageContainer) messageContainer.textContent = '';
  }

  // Event listeners para abrir el modal
  console.log('Botones "Apartar" encontrados:', allTriggerButtons.length);

  allTriggerButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`Click en botón ${index + 1}`);
      openModal();
    });
  });

  // Event listener para cerrar con el botón X
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  // Event listener para cerrar haciendo clic en el overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Event listener para cerrar con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  // Event listener para el submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!elements) {
      showMessage('El formulario de pago no está listo.');
      return;
    }

    setLoading(true);

    try {
      const returnUrl = `${window.location.origin}/pages/gracias.html`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (error.type === 'card_error' || error.type === 'validation_error') {
        showMessage(error.message);
      } else if (error) {
        showMessage('Un error inesperado ocurrió.');
      }

    } catch (integrationError) {
      console.error(integrationError);
      showMessage(integrationError.message);
    }

    setLoading(false);
  });

  // Funciones de ayuda
  function showMessage(messageText) {
    if (messageContainer) messageContainer.textContent = messageText;
  }

  function setLoading(isLoading) {
    if (submitButton) {
      submitButton.disabled = isLoading;
      if(buttonText) buttonText.textContent = isLoading ? 'Procesando...' : 'Pagar $500.00 MXN';
    }
  }
});
