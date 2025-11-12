// assets/js/modal.js - Modal functionality for payment forms

(function() {
  'use strict';

  // Modal state
  let currentModal = null;
  let currentForm = null;
  let currentPromoInfo = null;
  let isProcessing = false; // Flag to prevent closing during payment processing

  /**
   * Initialize modal functionality
   */
  function initModal() {
    const modalOverlay = document.getElementById('payment-modal');

    if (!modalOverlay) {
      console.error('Payment modal not found in DOM');
      return;
    }

    // Close button click
    const closeButton = modalOverlay.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        if (!isProcessing) {
          closeModal();
        }
      });
    }

    // Backdrop click (click outside modal content)
    modalOverlay.addEventListener('click', function(e) {
      if ((e.target === modalOverlay || e.target.classList.contains('modal-container')) && !isProcessing) {
        closeModal();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active') && !isProcessing) {
        closeModal();
      }
    });
  }

  /**
   * Open the payment modal
   * @param {HTMLElement} form - The payment form to display in modal
   * @param {Object} promoInfo - Information about the promotion
   */
  function openModal(form, promoInfo = {}) {
    const modalOverlay = document.getElementById('payment-modal');

    if (!modalOverlay) {
      console.error('Payment modal not found');
      return;
    }

    // Store current form and promo info
    currentForm = form;
    currentPromoInfo = promoInfo;

    // Get modal elements
    const modalBody = modalOverlay.querySelector('.modal-body');
    const modalPromoName = modalOverlay.querySelector('.modal-promo-name');
    const modalPromoPrice = modalOverlay.querySelector('.modal-promo-price');

    if (!modalBody) {
      console.error('Modal body not found');
      return;
    }

    // Update modal content
    if (modalPromoName && promoInfo.name) {
      modalPromoName.textContent = promoInfo.name;
    }

    if (modalPromoPrice && promoInfo.price) {
      modalPromoPrice.innerHTML = promoInfo.price;
    }

    // Clear modal body and add the form
    const existingForm = modalBody.querySelector('.payment-form');
    if (existingForm) {
      existingForm.remove();
    }

    // Clone the form and add it to modal
    const formClone = form.cloneNode(true);
    formClone.style.display = 'block';
    modalBody.appendChild(formClone);

    // Transfer the Stripe Elements and event listeners to the cloned form
    // We'll handle this in checkout.js by storing references

    // Show modal with animation
    modalOverlay.classList.remove('closing');
    modalOverlay.classList.add('active');
    document.body.classList.add('modal-open');

    // Focus on close button for accessibility
    const closeButton = modalOverlay.querySelector('.modal-close');
    if (closeButton) {
      setTimeout(() => closeButton.focus(), 100);
    }
  }

  /**
   * Close the payment modal
   */
  function closeModal() {
    const modalOverlay = document.getElementById('payment-modal');

    if (!modalOverlay) {
      return;
    }

    // Add closing animation
    modalOverlay.classList.add('closing');

    // Wait for animation to complete
    setTimeout(() => {
      modalOverlay.classList.remove('active', 'closing');
      document.body.classList.remove('modal-open');

      // Clean up modal body
      const modalBody = modalOverlay.querySelector('.modal-body');
      const existingForm = modalBody?.querySelector('.payment-form');
      if (existingForm) {
        existingForm.remove();
      }

      // Reset state
      currentForm = null;
      currentPromoInfo = null;
    }, 300); // Match the CSS transition duration
  }

  /**
   * Get the modal body element (used by checkout.js to mount Stripe Elements)
   */
  function getModalBody() {
    const modalOverlay = document.getElementById('payment-modal');
    return modalOverlay?.querySelector('.modal-body');
  }

  /**
   * Check if modal is currently open
   */
  function isModalOpen() {
    const modalOverlay = document.getElementById('payment-modal');
    return modalOverlay?.classList.contains('active') || false;
  }

  /**
   * Set processing state (prevents closing during payment)
   */
  function setProcessing(processing) {
    isProcessing = processing;
    const modalOverlay = document.getElementById('payment-modal');
    if (modalOverlay) {
      if (processing) {
        modalOverlay.classList.add('processing');
      } else {
        modalOverlay.classList.remove('processing');
      }
    }
  }

  /**
   * Get current processing state
   */
  function getProcessingState() {
    return isProcessing;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
  } else {
    initModal();
  }

  // Expose global API for use by checkout.js
  window.PaymentModal = {
    open: openModal,
    close: closeModal,
    getModalBody: getModalBody,
    isOpen: isModalOpen,
    setProcessing: setProcessing,
    isProcessing: getProcessingState
  };

})();
