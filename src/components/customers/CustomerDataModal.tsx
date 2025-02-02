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
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Omit<Customer, 'id' | 'created_at'>) => void;
}

export const CustomerDataModal = ({
  isOpen,
  onClose,
  onSave,
}: CustomerDataModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = (e: any) => {
    console.log('formData', formData);
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>¡Guarda tus vehículos favoritos!</ModalHeader>
        <ModalBody>
          <p className='text-sm text-gray-600 mb-4'>
            Te notificaremos cuando encontremos vehículos similares a buen
            precio.
          </p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              label='Nombre'
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
              required
            />
            <Input
              label='Apellido'
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
              required
            />
            <Input
              label='Email'
              type='email'
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <Input
              label='Teléfono'
              type='tel'
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
            />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            Cancelar
          </Button>
          <Button color='primary' onPress={handleSubmit}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
