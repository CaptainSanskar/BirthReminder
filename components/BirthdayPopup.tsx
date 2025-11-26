import React, { useState } from 'react';
import { Birthday } from '../types';
import { calculateNextAge } from '../utils/dateUtils';
import { Confetti } from './Confetti';
import { Share2, Check, Gift, Copy } from 'lucide-react';

interface Props {
    birthdays: Birthday[];
    onClose: () => void;
    onMarkCelebrated: (id: string) => void;
}

export const BirthdayPopup: React.FC<Props> = ({ birthdays, onClose, onMarkCelebrated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentBirthday = birthdays[0];
    const age = calculateNextAge(currentBirthday.birthDate);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleWhatsApp = () => {
        try {
            const text = `🎉 Happy ${age}th Birthday ${currentBirthday.name}! 🎂🎈

Wishing you an amazing day filled with joy and happiness! 🎁✨`;
            
            // Use WhatsApp API - will open WhatsApp app or web
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Mark as celebrated after a short delay (user has time to send)
            setTimeout(() => {
                onMarkCelebrated(currentBirthday.id);
            }, 1000);
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            alert('Could not open WhatsApp. Please try again.');
        }
    };
    
    const handleCopy = async () => {
        try {
            const text = `🎉 Happy ${age}th Birthday ${currentBirthday.name}! 🎂🎈

Wishing you an amazing day filled with joy and happiness! 🎁✨`;
            
            // Check if clipboard API is available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                // Show success message
                const button = document.activeElement as HTMLButtonElement;
                const originalText = button.innerHTML;
                button.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>Copied!</span>';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Birthday message copied to clipboard!');
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            alert('Could not copy message. Please try again.');
        }
    };

    if (!currentBirthday) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
            
            {isOpen && <Confetti />}

            <div className="relative w-full max-w-xs perspective-1000">
                
                {!isOpen ? (
                    <div 
                        className="bg-surface rounded-[3rem] shadow-2xl p-10 text-center cursor-pointer hover:scale-105 transition-transform border border-lime/30 animate-float relative overflow-hidden group"
                        onClick={handleOpen}
                    >
                        {/* Glow bg */}
                        <div className="absolute inset-0 bg-lime/5 opacity-50"></div>
                        
                        <div className="w-28 h-28 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-lime text-lime shadow-[0_0_30px_rgba(210,248,1,0.3)] relative z-10 group-hover:scale-110 transition-transform">
                            <Gift className="w-12 h-12 animate-pulse-slow" />
                        </div>
                        <h3 className="text-3xl font-bold text-primary mb-2 relative z-10">🎉 Birthday Alert!</h3>
                        <p className="text-lime text-lg font-bold relative z-10 mb-2">
                            Wish Happy Birthday to
                        </p>
                        <p className="text-primary text-2xl font-black relative z-10 mb-6">
                            {currentBirthday.name}
                        </p>
                        
                        <div className="inline-block px-6 py-2 bg-lime text-black font-bold rounded-full text-sm shadow-lg shadow-lime/20 relative z-10 animate-pulse">
                            TAP TO CELEBRATE 🎂
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface border border-dark-border rounded-[3rem] overflow-hidden animate-popup relative shadow-2xl">
                         {/* Header Image/Gradient */}
                         <div className="h-48 bg-neon-gradient flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            
                            {/* Big Avatar */}
                            <div className="w-32 h-32 bg-surface rounded-full border-8 border-surface flex items-center justify-center text-6xl shadow-2xl absolute -bottom-16 z-10">
                                {currentBirthday.emoji || '🎉'}
                            </div>
                         </div>

                         <div className="pt-20 pb-10 px-8 text-center">
                            <h2 className="text-4xl font-black text-primary mb-3 uppercase tracking-tight italic">Happy Birthday!</h2>
                            <div className="mb-2">
                                <p className="text-lime font-bold text-xl mb-1">
                                    Wish Happy Birthday to
                                </p>
                                <p className="text-primary font-black text-3xl mb-3">
                                    {currentBirthday.name}! 🎉
                                </p>
                            </div>
                            <p className="text-muted font-medium text-base mb-8">
                                Turning <span className="font-bold text-2xl bg-lime text-black px-3 py-1 rounded-lg mx-1">{age}</span> today!
                            </p>

                            <div className="space-y-3">
                                <button 
                                    onClick={handleWhatsApp}
                                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
                                    title="Send birthday wishes via WhatsApp"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    Send via WhatsApp
                                </button>
                                
                                <button 
                                    onClick={handleCopy}
                                    className="w-full bg-surfaceLight hover:bg-white/10 text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-dark-border transition-all active:scale-95"
                                    title="Copy birthday message to clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Birthday Message
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button 
                                        onClick={() => onMarkCelebrated(currentBirthday.id)}
                                        className="bg-surfaceLight hover:bg-white/10 text-primary font-medium py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-dark-border"
                                    >
                                        <Check className="w-4 h-4" />
                                        Done
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="text-muted hover:text-primary font-medium py-3 rounded-2xl transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};