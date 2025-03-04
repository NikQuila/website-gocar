'use client';

import { Customer } from '@/utils/types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@heroui/react';
import { useState } from 'react';

interface CustomerDataModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id' | 'created_at'>) => void;
  isLoading?: boolean;
}

export const CustomerDataModal = ({
  isOpen,
  onClose,
  onSave,
  title = '¡Guarda tus vehículos favoritos!',
  description = 'Te notificaremos cuando encontremos vehículos similares a buen precio.',
  isLoading = false,
}: CustomerDataModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = (e: any) => {
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
      scrollBehavior='inside'
      placement='center'
      classNames={{
        base: 'dark:bg-dark-card mx-auto my-0 sm:m-4 w-full rounded-2xl max-h-[90vh]',
        header:
          'dark:text-white border-b border-gray-200 dark:border-gray-700 rounded-t-2xl sticky top-0 z-10 bg-white dark:bg-dark-card',
        body: 'dark:bg-dark-card p-4 sm:p-6 overflow-y-auto',
        footer:
          'border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-2xl sticky bottom-0 z-10 bg-white dark:bg-dark-card',
        backdrop: 'bg-black/50',
        wrapper: 'flex items-center justify-center min-h-screen px-4',
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent className='w-full max-w-md mx-auto rounded-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        {(onClose) => (
          <>
            <ModalHeader className='text-xl sm:text-2xl font-semibold'>
              {title}
            </ModalHeader>
            <ModalBody>
              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6'>
                {description}
              </p>
              <form
                onSubmit={handleSubmit}
                className='space-y-5 max-h-[30vh] overflow-y-auto sm:max-h-none sm:overflow-visible'
              >
                <Input
                  label='Nombre'
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  classNames={{
                    label: 'dark:text-gray-400 text-sm font-medium',
                    input:
                      'dark:bg-dark-card dark:text-white dark:border-gray-700',
                    innerWrapper: 'bg-transparent',
                    inputWrapper: 'bg-transparent shadow-none',
                  }}
                  variant='bordered'
                  size='lg'
                  isDisabled={isLoading}
                  required
                />
                <Input
                  label='Apellido'
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  classNames={{
                    label: 'dark:text-gray-400 text-sm font-medium',
                    input:
                      'dark:bg-dark-card dark:text-white dark:border-gray-700',
                    innerWrapper: 'bg-transparent',
                    inputWrapper: 'bg-transparent shadow-none',
                  }}
                  variant='bordered'
                  size='lg'
                  isDisabled={isLoading}
                  required
                />
                <Input
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  classNames={{
                    label: 'dark:text-gray-400 text-sm font-medium',
                    input:
                      'dark:bg-dark-card dark:text-white dark:border-gray-700',
                    innerWrapper: 'bg-transparent',
                    inputWrapper: 'bg-transparent shadow-none',
                  }}
                  variant='bordered'
                  size='lg'
                  isDisabled={isLoading}
                  required
                />
                <Input
                  label='Teléfono'
                  type='tel'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className='pb-20 md:pb-0'
                  classNames={{
                    label: 'dark:text-gray-400 text-sm font-medium',
                    input:
                      'dark:bg-dark-card dark:text-white dark:border-gray-700',
                    innerWrapper: 'bg-transparent',
                    inputWrapper: 'bg-transparent shadow-none',
                  }}
                  variant='bordered'
                  size='lg'
                  isDisabled={isLoading}
                  required
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                <Button
                  color='danger'
                  variant='light'
                  onPress={onClose}
                  className='w-full sm:w-auto dark:text-white'
                  isDisabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  color='primary'
                  onPress={handleSubmit}
                  className='w-full sm:w-auto'
                  isDisabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
