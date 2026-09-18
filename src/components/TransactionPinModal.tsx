import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  actionName: string;
}

export default function TransactionPinModal({ isOpen, onClose, onSuccess, actionName }: TransactionPinModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: Enter new PIN, 2: Confirm new PIN
  const [firstPin, setFirstPin] = useState('');

  // When modal opens, check if they have a PIN set
  // For simplicity and speed, we will first attempt to verify an empty PIN.
  // Actually, we can check if they have a PIN via an API, or handle the 400 'Transaction PIN is not set' from the verify API.
  
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setLoading(false);
      setIsSetupMode(false);
      setSetupStep(1);
      setFirstPin('');
    }
  }, [isOpen]);

  const handleVerify = async (enteredPin: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onSuccess(enteredPin);
      } else {
        if (data.error === 'Transaction PIN is not set. Please set it in Settings first.') {
          setIsSetupMode(true);
          setPin('');
        } else {
          setError(data.error || 'Invalid PIN');
          setPin('');
        }
      }
    } catch (err) {
      setError('Connection error. Try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (enteredPin: string) => {
    if (setupStep === 1) {
      setFirstPin(enteredPin);
      setSetupStep(2);
      setPin('');
      return;
    }
    
    if (setupStep === 2) {
      if (enteredPin !== firstPin) {
        setError('PINs do not match. Try again.');
        setPin('');
        setSetupStep(1);
        setFirstPin('');
        return;
      }
      
      // Save new PIN
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth/pin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: enteredPin })
        });
        
        if (res.ok) {
          // Setup success, now verify it to continue action
          setIsSetupMode(false);
          onSuccess(enteredPin);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to setup PIN');
          setPin('');
          setSetupStep(1);
          setFirstPin('');
        }
      } catch (err) {
        setError('Connection error');
        setPin('');
        setSetupStep(1);
        setFirstPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        if (isSetupMode) handleSetup(newPin);
        else handleVerify(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface-container-lowest w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-surface-container"
        >
          {/* Header */}
          <div className="p-6 pb-2 text-center relative">
            <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">dialpad</span>
            </div>
            <h3 className="font-headline-sm font-bold text-on-surface">
              {isSetupMode ? (setupStep === 1 ? 'Create PIN' : 'Confirm PIN') : 'Enter Security PIN'}
            </h3>
            <p className="font-body-sm text-outline mt-1 px-4">
              {isSetupMode 
                ? 'Create a 6-digit PIN to secure your transactions.' 
                : `Authorize: ${actionName}`
              }
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-3 py-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length 
                    ? 'bg-primary scale-110 shadow-sm' 
                    : 'bg-surface-container-high'
                } ${error ? 'bg-error animate-pulse' : ''}`}
              />
            ))}
          </div>
          
          {error && <p className="text-center text-error font-label-sm text-[12px] pb-2 font-bold">{error}</p>}
          {loading && <p className="text-center text-primary font-label-sm text-[12px] pb-2 animate-pulse">Verifying securely...</p>}

          {/* Numpad */}
          <div className="p-6 pt-2 bg-surface-container-low/50">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  disabled={loading}
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 transition-all text-on-surface font-headline-md font-bold flex items-center justify-center disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <div className="h-14"></div>
              <button
                disabled={loading}
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 transition-all text-on-surface font-headline-md font-bold flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                disabled={loading}
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 transition-all text-on-surface font-headline-md font-bold flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            </div>
            
            {!isSetupMode && (
              <div className="mt-6 text-center">
                <button className="text-primary font-label-sm font-bold hover:underline">
                  Forgot PIN?
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
