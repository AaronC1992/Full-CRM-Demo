'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { ServiceLineItem } from '@/lib/service-pricing';
import { showToast } from '@/components/ui/Toast';

type ServicePricingModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  initialItems: ServiceLineItem[];
  onSave: (items: ServiceLineItem[]) => void;
};

function makeItem(name = '', price = 0): ServiceLineItem {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    price,
  };
}

export default function ServicePricingModal({ open, onClose, title, initialItems, onSave }: ServicePricingModalProps) {
  const [items, setItems] = useState<ServiceLineItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(initialItems.length > 0 ? initialItems : [makeItem()]);
  }, [open, initialItems]);

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const updateItem = (id: string, field: 'name' | 'price', value: string) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      if (field === 'name') return { ...item, name: value };
      const parsed = Number(value);
      return { ...item, price: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 };
    }));
  };

  const addItem = () => setItems((current) => [...current, makeItem()]);

  const removeItem = (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id);
      return next.length > 0 ? next : [makeItem()];
    });
  };

  const handleSave = () => {
    const cleaned = items
      .map((item, index) => ({
        id: item.id || `line-${Date.now()}-${index}`,
        name: item.name.trim(),
        price: Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0,
      }))
      .filter((item) => item.name.length > 0);

    onSave(cleaned);
    showToast('Service pricing saved.');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Add services and set a custom price for this lead or customer.
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_140px_auto] gap-2">
              <input
                value={item.name}
                onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                placeholder="Service name"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                step="1"
                value={item.price}
                onChange={(event) => updateItem(item.id, 'price', event.target.value)}
                placeholder="0"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-gray-500 hover:text-red-500"
                title="Remove service"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus size={15} /> Add service
        </button>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm">
          <span className="text-gray-500">Estimated total</span>
          <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save services
          </button>
        </div>
      </div>
    </Modal>
  );
}
