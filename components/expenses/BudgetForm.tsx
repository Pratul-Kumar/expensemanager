'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BudgetFormProps {
  initialAmount?: number;
  onSave: (amount: number) => void;
  onClose: () => void;
  saving: boolean;
}

export function BudgetForm({ initialAmount, onSave, onClose, saving }: BudgetFormProps) {
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    setError('');
    onSave(val);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Budget Amount"
        type="number"
        prefix="₹"
        placeholder="e.g. 25000"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          if (error) setError('');
        }}
        error={error}
        autoFocus
      />
      
      <div className="flex items-center gap-3 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={saving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={saving}
          className="flex-1"
        >
          Save
        </Button>
      </div>
    </form>
  );
}
