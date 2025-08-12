'use client';

import { useCartStore } from '@/lib/cartStore';
// Removed Next Image import - using regular img for better compatibility
import { X, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [whatsappNumber, setWhatsappNumber] = useState('+33123456789');
  
  useEffect(() => {
    // Charger le numéro WhatsApp depuis les settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsappLink) {
          // Extraire le numéro du lien WhatsApp
          const match = data.whatsappLink.match(/wa\.me\/(\+?[0-9]+)/);
          if (match) {
            setWhatsappNumber(match[1]);
          }
        } else if (data.telegramUsername) {
          // Garder une compatibilité avec l'ancien système
          const username = data.telegramUsername.startsWith('@') 
            ? data.telegramUsername 
            : `@${data.telegramUsername}`;
          setWhatsappNumber(username); // Temporaire pour transition
        }
      })
      .catch(() => {});
  }, []);
  
  const handleSendOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    // Calculer le total
    const total = getTotalPrice();
    
    // Construire le message
    let message = `🛒 **DÉTAIL DE LA COMMANDE:**\n\n`;
    
    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      
      message += `${index + 1}. 🍒 ${item.productName}\n`;
      message += `   • Quantité: ${item.quantity}x ${item.weight}\n`;
      message += `   • Prix unitaire: ${item.originalPrice}€\n`;
      message += `   • Total: ${itemTotal.toFixed(2)}€\n`;
      
      if (item.discount > 0) {
        message += `   • Remise: -${item.discount}%\n`;
      }
      
      message += '\n';
    });
    
    message += `💰 **TOTAL: ${total.toFixed(2)}€**`;
    
    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);
    
    // Nettoyer le numéro WhatsApp (supprimer les espaces et caractères spéciaux)
    const cleanNumber = whatsappNumber.replace(/[@\s\-\(\)]/g, '');
    
    // Ouvrir WhatsApp avec le message pré-rempli
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Ouvrir dans une nouvelle fenêtre
    window.open(whatsappUrl, '_blank');
    
    // Afficher un message de succès
    toast.success('Redirection vers WhatsApp...');
    
    // Optionnel : vider le panier après un délai
    setTimeout(() => {
      clearCart();
      setIsOpen(false);
    }, 2000);
  };
  
  if (!isOpen) return null;
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotalPrice();
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl pointer-events-auto overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">Mon Panier</h2>
              <span className="rounded-full bg-green-500 px-2 py-1 text-sm font-medium text-black">
                {totalItems} article{totalItems > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.weight}`} className="rounded-lg bg-gray-800/50 p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.productName}</h3>
                        <p className="text-sm text-gray-400">
                          {item.weight} - {item.originalPrice}€
                          {item.discount > 0 && (
                            <span className="ml-2 rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                              -{item.discount}%
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-lg font-bold text-green-400">
                          {(item.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                            className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                            className="rounded bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.weight)}
                          className="rounded p-1 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg text-gray-400">Total:</span>
                <span className="text-2xl font-bold text-green-400">{total.toFixed(2)}€</span>
              </div>
              
              <button
                onClick={handleSendOrder}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-3 font-medium text-white hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
              >
                <span>📱</span>
                {whatsappNumber.includes('@') ? `Envoyer à ${whatsappNumber}` : `Commander sur WhatsApp`}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="mt-3 w-full rounded-lg bg-gray-800 py-3 font-medium text-white hover:bg-gray-700 transition-colors"
              >
                Continuer les achats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}