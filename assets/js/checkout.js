// assets/js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
  
  // --- ¡IMPORTANTE! ---
  // Esta es tu clave PUBLICABLE de prueba
  const stripe = Stripe('pk_test_51SICj4E3tRmLuv8snjPN6su1r1XD2CoOhufLhdSXwZm6W5endnRQBXki3UeE612VTLuLTkTLRy7nuWRmxEbS7AHP00A3JVqIzE');

  // 1. Busca todos los formularios (que están ocultos)
  const allPaymentForms = document.querySelectorAll('.payment-form');
  
  if (allPaymentForms.length === 0) {
    return; // No hay formularios
  }

  // 2. Itera sobre CADA formulario para prepararlo
  allPaymentForms.forEach(form => {
    
    // Busca los componentes de ESTA tarjeta
    const triggerButton = form.previousElementSibling; // El botón "Apartar" que está ANTES del form
    const elementsContainer = form.querySelector('.payment-element');
    const placeholder = form.querySelector('.payment-element-placeholder');
    const submitButton = form.querySelector('.submit-button');
    const buttonText = form.querySelector('.button-text');
    const messageContainer = form.querySelector('.payment-message');
    
    let elements; // Variable para guardar la instancia de Stripe Elements

    // 3. Agrega el listener al botón "Apartar"
    triggerButton.addEventListener('click', async (e) => {
      e.preventDefault();

      // Oculta el botón "Apartar" y muestra el formulario (que tiene el spinner)
      triggerButton.style.display = 'none';
      form.style.display = 'block';

      // Si ya hicimos clic y cargamos el formulario, no hacer nada más
      if (form.dataset.initialized === 'true') {
        return;
      }

      // Marcar como inicializado
      form.dataset.initialized = 'true';

      // 4. AHORA SÍ: Llama al backend para obtener el clientSecret
      try {
        const response = await fetch('/api/server', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promoId: form.dataset.promoId }), 
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error.message || `Error del servidor: ${response.status}`);
        }

        const { clientSecret, error: backendError } = await response.json();

        if (backendError) {
          throw new Error(backendError);
        }

        // 5. Crear y montar el formulario de Stripe
        elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create('payment');
        
        // Cuando el formulario real esté listo para mostrarse...
        paymentElement.on('ready', () => {
          // ...oculta el spinner
          if (placeholder) placeholder.style.display = 'none';
        });

        // Monta el formulario en el div
        paymentElement.mount(elementsContainer);

      } catch (e) {
         if(placeholder) placeholder.textContent = `Error: ${e.message}`;
         console.error(e);
      }
    }); // Fin del listener del botón "Apartar"


    // 6. Agrega el listener al botón "Pagar" (el que está DENTRO del formulario)
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
    }); // Fin del listener del form "submit"

    // --- Funciones de ayuda (específicas para este form) ---
    function showMessage(messageText) {
      if (messageContainer) messageContainer.textContent = messageText;
    }

    function setLoading(isLoading) {
      if (submitButton) {
        submitButton.disabled = isLoading;
        if(buttonText) buttonText.textContent = isLoading ? 'Procesando...' : 'Pagar $500.00 MXN';
      }
    }
  }); // Fin del forEach
});
