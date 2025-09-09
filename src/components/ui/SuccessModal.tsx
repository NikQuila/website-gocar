import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  leadType?: string;
  customMessage?: string;
}

/**
 * Modal de éxito reutilizable para diferentes tipos de formularios
 */
const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = '¡Solicitud enviada con éxito!',
  message = 'Tu solicitud ha sido recibida. Nos pondremos en contacto contigo lo antes posible.',
  buttonText = 'Aceptar',
  leadType,
  customMessage,
}) => {
  // Mensajes personalizados según el tipo de lead
  const getCustomMessage = () => {
    // Si hay un mensaje personalizado, usarlo
    if (customMessage) return customMessage;

    if (!leadType) return message;

    switch (leadType) {
      case 'buy-consignment':
        return 'Tu solicitud de consignación ha sido recibida. Nos pondremos en contacto contigo lo antes posible para evaluar tu vehículo.';
      case 'buy-direct':
        return 'Tu solicitud de venta ha sido recibida. Un asesor se comunicará contigo para ofrecerte una cotización por tu vehículo.';
      case 'sell-financing':
        return 'Tu solicitud de financiamiento ha sido recibida. Un ejecutivo se comunicará contigo para presentarte las opciones disponibles.';
      case 'contact-general':
        return 'Tu mensaje ha sido recibido. Nos pondremos en contacto contigo lo antes posible.';
      case 'search-request':
        return 'Tu solicitud de búsqueda ha sido recibida. Te contactaremos cuando encontremos vehículos que se ajusten a tus criterios.';
      default:
        return message;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      placement='center'
      classNames={{
        body: 'py-6',
        backdrop: 'bg-[#292f46]/50 backdrop-opacity-40',
        base: 'border-[#292f46] bg-white dark:bg-gray-900',
        header: 'border-b-[1px] border-[#292f46]',
        footer: 'border-t-[1px] border-[#292f46]',
      }}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
              {title}
            </h3>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className='text-center'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {getCustomMessage()}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color='primary'
            onPress={onClose}
            className='w-full bg-primary text-white'
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;
