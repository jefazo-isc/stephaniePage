// assets/js/checkout.js
document.addEventListener('DOMContentLoaded', () => {

  // --- ¡IMPORTANTE! ---
  // Esta es tu clave PUBLICABLE de prueba
  const stripe = Stripe('pk_live_51SRzsBIKacSnSmO53KhqZC1tAwEgMYOU2V2o5WW2dEWZCe4BpiMARkHdhEC8HDiZhRXGRKSSrfKWdMx62tj917Ks00afZo71cn');

  // 1. Busca todos los formularios (que están ocultos)
  const allPaymentForms = document.querySelectorAll('.payment-form');

  if (allPaymentForms.length === 0) {
    return; // No hay formularios
  }

  // Almacenar instancias de Stripe Elements para reutilizarlas
  const stripeInstances = new Map();

  // 2. Itera sobre CADA formulario para prepararlo
  allPaymentForms.forEach((form, index) => {

    // Busca los componentes de ESTA tarjeta
    const triggerButton = form.previousElementSibling; // El botón "Apartar" que está ANTES del form

    // Extract promo info from the card
    const promoCard = form.closest('.promo-card');
    const promoTitle = promoCard?.querySelector('.promo-title')?.textContent || 'Promoción';
    const promoSubtitle = promoCard?.querySelector('.promo-subtitle')?.textContent || '';
    const promoPrice = promoCard?.querySelector('.new-price')?.innerHTML || '$500.00';

    const promoInfo = {
      name: `${promoTitle}${promoSubtitle ? ' - ' + promoSubtitle : ''}`,
      price: promoPrice
    };

    // 3. Agrega el listener al botón "Apartar"
    triggerButton.addEventListener('click', async (e) => {
      e.preventDefault();

      // Verificar si ya existe una instancia para este formulario
      if (stripeInstances.has(index)) {
        // Solo abrir el modal, ya tenemos el formulario cargado
        if (window.PaymentModal) {
          window.PaymentModal.open(form, promoInfo);
        }
        return;
      }

      // Open modal
      if (window.PaymentModal) {
        window.PaymentModal.open(form, promoInfo);
      }

      // Marcar como inicializado para evitar múltiples cargas
      stripeInstances.set(index, { loading: true });

      // Get references to modal elements
      const modalBody = document.querySelector('#payment-modal .modal-body');
      const modalForm = modalBody?.querySelector('.payment-form');

      if (!modalForm) {
        console.error('Form not found in modal');
        return;
      }

      const elementsContainer = modalForm.querySelector('.payment-element');
      const placeholder = modalForm.querySelector('.payment-element-placeholder');
      const submitButton = modalForm.querySelector('.submit-button');
      const buttonText = modalForm.querySelector('.button-text');
      const messageContainer = modalForm.querySelector('.payment-message');

      // 4. Llama al backend para obtener el clientSecret
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

        // 5. Crear y montar el formulario de Stripe (solo una vez)
        const elements = stripe.elements({ clientSecret });

        // --- MODIFICACIÓN AQUÍ ---
        // Desactivamos Link para forzar los campos de billing
        const paymentElementOptions = {
          fields: {
            billingDetails: {
              address: 'auto',
              phone: 'auto',
              name: 'auto',
              email: 'auto'
            }
          },
          wallets: {
            link: 'never' // <-- AÑADIMOS ESTO PARA DESACTIVAR LINK
          },
          layout: 'tabs'
        };
        
        // Pasamos las opciones al crear el elemento
        const paymentElement = elements.create('payment', paymentElementOptions);
        // --- FIN DE LA MODIFICACIÓN ---


        // Cuando el formulario real esté listo para mostrarse...
        paymentElement.on('ready', () => {
          // ...oculta el spinner
          if (placeholder) placeholder.style.display = 'none';
        });

        // Monta el formulario en el div del modal
        paymentElement.mount(elementsContainer);

        // Almacenar la instancia para reutilizarla
        stripeInstances.set(index, {
          elements,
          paymentElement,
          elementsContainer,
          submitButton,
          buttonText,
          messageContainer,
          loaded: true
        });

        // Set up form submission for the modal form (solo una vez)
        modalForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const instance = stripeInstances.get(index);
          if (!instance || !instance.elements) {
            showMessage(messageContainer, 'El formulario de pago no está listo.');
            return;
          }

          setLoading(instance.submitButton, instance.buttonText, true);

          try {
            const returnUrl = `${window.location.origin}/pages/gracias.html`;

            const { error } = await stripe.confirmPayment({
              elements: instance.elements,
              confirmParams: {
                return_url: returnUrl,
              },
            });

            if (error.type === 'card_error' || error.type === 'validation_error') {
              showMessage(instance.messageContainer, error.message);
            } else if (error) {
              showMessage(instance.messageContainer, 'Un error inesperado ocurrió.');
            }

          } catch (integrationError) {
            console.error(integrationError);
            showMessage(instance.messageContainer, integrationError.message);
          }

          setLoading(instance.submitButton, instance.buttonText, false);
        }, { once: true }); // Solo agregar el listener una vez

      } catch (e) {
         if(placeholder) placeholder.textContent = `Error: ${e.message}`;
         console.error(e);
         stripeInstances.delete(index); // Permitir reintentar en caso de error
      }
    });

  }); // Fin del forEach

  // --- Funciones de ayuda ---
  function showMessage(messageContainer, messageText) {
    if (messageContainer) messageContainer.textContent = messageText;
  }

  function setLoading(submitButton, buttonText, isLoading) {
    if (submitButton) {
      submitButton.disabled = isLoading;
      if(buttonText) buttonText.textContent = isLoading ? 'Procesando...' : 'Pagar $500.00 MXN';
    }
  }
});
