import React, { useState, useEffect, useMemo } from 'react';
import { Birthday } from './types';
import { calculateDaysUntil, sortBirthdays, calculateNextAge, isToday, formatDateFriendly } from './utils/dateUtils';
import { AddBirthdayModal } from './components/AddBirthdayModal';
import { BirthdayPopup } from './components/BirthdayPopup';
import { CalendarView } from './components/CalendarView';
import { WelcomeModal } from './components/WelcomeModal';
import { ReviewView } from './components/ReviewView';
import { syncToIndexedDB, registerServiceWorker } from './utils/storage';
import { notificationService } from './utils/notificationService';
import { Plus, Calendar as CalendarIcon, Home, Settings, Bell, Search, Gift, Sparkles, Zap, Edit2, Camera, Moon, Sun, MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'cakewait_birthdays';
const USER_KEY = 'cakewait_username';
const GENDER_KEY = 'cakewait_gender';
const THEME_KEY = 'cakewait_theme';

export default function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [username, setUsername] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<'home' | 'list' | 'reviews' | 'settings'>('home');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [popupBirthdays, setPopupBirthdays] = useState<Birthday[]>([]);
  const [shownPopups, setShownPopups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Load data
  useEffect(() => {
    // 1. Register Service Worker for background notifications
    registerServiceWorker();
    
    // 2. Initialize Firebase Notification Service
    notificationService.initialize();

    // 3. Load Data
    const savedBirthdays = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    const savedGender = localStorage.getItem(GENDER_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedBirthdays) {
      try {
        const parsed = JSON.parse(savedBirthdays);
        setBirthdays(parsed);
        // Sync loaded data to IndexedDB immediately
        syncToIndexedDB(parsed);
      } catch (e) {
        console.error("Failed to parse birthdays", e);
      }
    }

    if (savedUser) {
        setUsername(savedUser);
    } else {
        // If no user, show welcome modal after a short delay
        setTimeout(() => setIsWelcomeOpen(true), 500);
    }

    if (savedGender) {
        setGender(savedGender as 'male' | 'female');
    }

    if (savedTheme) {
        setTheme(savedTheme as 'dark' | 'light');
    }
    
    // Check notification status from multiple sources
    const savedNotificationStatus = localStorage.getItem('notifications_enabled');
    if (savedNotificationStatus === 'true') {
        setNotificationsEnabled(true);
    } else if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
    }
  }, []);

  // Theme effect
  useEffect(() => {
      if (theme === 'light') {
          document.body.classList.add('light-mode');
      } else {
          document.body.classList.remove('light-mode');
      }
      localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Save birthdays to both LocalStorage and IndexedDB
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
    if (birthdays.length > 0) {
        syncToIndexedDB(birthdays);
    }
  }, [birthdays]);

  // Save profile
  const handleSaveProfile = (name: string, newGender: 'male' | 'female') => {
      setUsername(name);
      setGender(newGender);
      localStorage.setItem(USER_KEY, name);
      localStorage.setItem(GENDER_KEY, newGender);
      setIsWelcomeOpen(false);
  };

  // Check for today's birthdays (with shown check)
  useEffect(() => {
    // Filter for birthdays that are today AND haven't been shown in this session yet
    const todayMatches = birthdays.filter(b => {
        if (!isToday(b.birthDate)) return false;
        return !shownPopups.has(b.id);
    });

    if (todayMatches.length > 0) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
            setPopupBirthdays(todayMatches);
            // Add to shown set
            setShownPopups(prev => {
                const next = new Set(prev);
                todayMatches.forEach(b => next.add(b.id));
                return next;
            });
        }, 1000);
    }
  }, [birthdays, shownPopups]);

  const handleAddOrUpdate = (birthday: Birthday) => {
    if (editingId) {
      setBirthdays(prev => prev.map(b => b.id === editingId ? birthday : b));
      setEditingId(null);
    } else {
      setBirthdays(prev => [...prev, birthday]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this birthday?')) {
      setBirthdays(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleRequestNotification = async () => {
    try {
        // Check if we're in a mobile app or WebView
        const isWebView = /wv|WebView/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        
        // In mobile WebView, use service worker notifications directly
        if ((isWebView || isAndroid || isIOS) && 'serviceWorker' in navigator) {
            console.log('📱 Mobile/WebView detected, using service worker notifications');
            
            try {
                const registration = await navigator.serviceWorker.ready;
                
                // Enable notifications without browser API
                setNotificationsEnabled(true);
                localStorage.setItem('notifications_enabled', 'true');
                
                // Show test notification via service worker
                await registration.showNotification('🎉 Notifications Enabled!', {
                    body: 'You will now receive birthday reminders',
                    icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
                    vibrate: [200, 100, 200],
                    tag: 'test-notification'
                });
                
                console.log('✅ Mobile notifications enabled');
                
                // Trigger birthday check
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ action: 'checkBirthdays' });
                }
                
                return;
            } catch (swError) {
                console.error('Service worker notification failed:', swError);
                // Continue to fallback below
            }
        }
        
        // Check if notifications are supported (for desktop browsers)
        if (!('Notification' in window)) {
            // If in WebView/APK and SW failed, still enable but show warning
            if (isWebView || isAndroid || isIOS) {
                setNotificationsEnabled(true);
                localStorage.setItem('notifications_enabled', 'true');
                alert('Notifications enabled! You will receive birthday reminders.');
                return;
            }
            alert('Notifications are not supported in your browser. Please try using Chrome, Firefox, or Edge.');
            return;
        }
        
        // Check if we're on a secure context (HTTPS or localhost)
        if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
            console.warn('Notifications require HTTPS');
        }
        
        // Try Firebase notification service first
        try {
            const token = await notificationService.requestPermission();
            
            if (token) {
                setNotificationsEnabled(true);
                console.log('✅ Firebase notifications enabled. Token:', token);
                
                // Trigger SW check immediately
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ action: 'checkBirthdays' });
                }
                return;
            }
        } catch (firebaseError) {
            console.log('Firebase notification setup failed, using fallback:', firebaseError);
        }
        
        // Fallback to regular browser notification
        console.log('Using browser notification fallback...');
        const result = await Notification.requestPermission();
        
        if (result === 'granted') {
            setNotificationsEnabled(true);
            console.log('✅ Browser notifications enabled');
            
            // Wait for service worker to be ready before showing notification
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    
                    // Show a test notification
                    await registration.showNotification('🎉 Notifications Enabled!', {
                        body: 'You will now receive birthday reminders',
                        icon: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
                        badge: 'https://cdn-icons-png.flaticon.com/512/4213/4213652.png',
                        vibrate: [200, 100, 200],
                        tag: 'test-notification'
                    });
                    
                    console.log('✅ Test notification sent');
                    
                    // Trigger SW check immediately
                    if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({ action: 'checkBirthdays' });
                    }
                } catch (swError) {
                    console.warn('Service worker not ready yet:', swError);
                    // Still set as enabled even if SW isn't ready
                }
            }
        } else if (result === 'denied') {
            alert('Notifications were blocked. Please enable them in your browser settings to receive birthday reminders.');
        }
    } catch (error) {
        console.error('Error requesting notifications:', error);
        alert('There was an error enabling notifications. Please try again or check your browser settings.');
    }
  };

  const sortedBirthdays = useMemo(() => sortBirthdays(birthdays), [birthdays]);
  const filteredBirthdays = useMemo(() => {
      return sortedBirthdays.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sortedBirthdays, searchQuery]);

  const nextBirthday = sortedBirthdays[0];

  // Construct Avatar URL based on gender preference
  const avatarUrl = useMemo(() => {
      if (gender === 'female') {
          return "https://zytofnesmigoejbtyboe.supabase.co/storage/v1/object/sign/movie-posters/femlae%20vatar.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzY0YzQ3OS1lZjg5LTQzMTYtOTYyNy0yN2ViMDI0MTc2MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtb3ZpZS1wb3N0ZXJzL2ZlbWxhZSB2YXRhci5qcGciLCJpYXQiOjE3NjM3OTgxMzksImV4cCI6MTc5NTMzNDEzOX0.KJ4F0oqKFkMJ_kxRXgR4IdCT28Ayqkua7jdTXjCIFKY";
      }
      // Male
      return "https://zytofnesmigoejbtyboe.supabase.co/storage/v1/object/sign/movie-posters/maleavatr.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzY0YzQ3OS1lZjg5LTQzMTYtOTYyNy0yN2ViMDI0MTc2MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtb3ZpZS1wb3N0ZXJzL21hbGVhdmF0ci5qcGciLCJpYXQiOjE3NjM3OTgxNzQsImV4cCI6MTc5NTMzNDE3NH0.-eXsogWVvznhkvpQlJPKGCKfLWjlQRFYnOJXOXMKiQk";
  }, [gender]);

  return (
    <div className="min-h-screen bg-background text-primary pb-32 relative selection:bg-lime selection:text-black overflow-x-hidden">
        
        {/* Dynamic Background Mesh */}
        <div className="fixed top-0 left-0 w-full h-[50vh] bg-mesh opacity-40 pointer-events-none z-0 transition-colors duration-500"></div>

        {/* Sticky Header */}
        <header className="pt-14 pb-4 px-6 flex justify-between items-center sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-dark-border">
            <div className="flex items-center gap-3">
                {/* Avatar with Edit Overlay */}
                <div 
                    className="relative group cursor-pointer"
                    onClick={() => setIsWelcomeOpen(true)}
                >
                    <div className="w-10 h-10 rounded-full bg-surfaceLight border border-dark-border flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-lime opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-surfaceLight border border-dark-border rounded-full p-0.5 text-muted group-hover:text-lime transition-colors">
                        <Camera size={10} />
                    </div>
                </div>

                <div>
                    <h1 className="text-sm font-medium text-muted uppercase tracking-wider text-[10px]">Welcome Back</h1>
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold leading-none text-primary max-w-[150px] truncate">
                            {username || 'Friend'}
                        </p>
                        <button 
                            onClick={() => setIsWelcomeOpen(true)}
                            className="text-muted hover:text-lime transition-colors p-0.5 hover:bg-surfaceLight rounded"
                            aria-label="Edit Name"
                        >
                            <Edit2 size={12} />
                        </button>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleRequestNotification}
                className={`w-10 h-10 rounded-full border border-dark-border flex items-center justify-center transition-all active:scale-90 ${notificationsEnabled ? 'bg-lime/10 text-lime border-lime/20' : 'bg-surfaceLight text-muted'}`}
            >
                <Bell className="w-5 h-5" />
            </button>
        </header>

        <main className="px-6 mt-6 space-y-8 relative z-10">
            
            {view === 'home' && (
                <>
                    {/* BENTO GRID DASHBOARD */}
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* Hero Card - Next Birthday (Takes full width on mobile, or 2 cols) */}
                        <div className="col-span-2 bg-dark-card border border-dark-border rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl card-shine">
                             {/* Neon Glow Effect */}
                             <div className="absolute -top-20 -right-20 w-40 h-40 bg-lime/20 blur-[60px] rounded-full"></div>
                             
                             {nextBirthday ? (
                                <div className="relative z-10 flex justify-between h-full min-h-[140px]">
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-lime text-black text-[10px] font-bold uppercase tracking-wider rounded-md">Up Next</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-primary leading-tight max-w-[150px] truncate">{nextBirthday.name}</h2>
                                            <p className="text-muted text-sm mt-1">Turning {calculateNextAge(nextBirthday.birthDate)}</p>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <span className="text-5xl font-bold text-primary tracking-tighter">{calculateDaysUntil(nextBirthday.birthDate)}</span>
                                            <span className="text-sm text-muted ml-1 font-medium">days left</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                         <div className="w-14 h-14 rounded-2xl bg-surfaceLight border border-dark-border flex items-center justify-center text-3xl shadow-inner">
                                            {nextBirthday.emoji || '🎂'}
                                         </div>
                                         <Gift className="text-lime opacity-20 w-16 h-16 absolute bottom-0 right-0 -rotate-12 translate-x-2 translate-y-2" />
                                    </div>
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-center">
                                    <Sparkles className="text-lime mb-2 opacity-50" />
                                    <p className="font-bold text-muted">No upcoming<br/>birthdays</p>
                                </div>
                             )}
                        </div>

                        {/* Quick Action: Add Birthday */}
                        <button 
                            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                            className="col-span-1 bg-lime text-black rounded-[2rem] p-5 flex flex-col justify-between items-start h-32 hover:bg-lime-dim transition-colors active:scale-95 shadow-lg shadow-lime/10 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-lg leading-none">Add</p>
                                <p className="text-xs font-medium opacity-70 mt-1">Birthday</p>
                            </div>
                        </button>

                        {/* Quick Action: View Stats (Placeholder) */}
                        <div className="col-span-1 bg-surfaceLight border border-dark-border rounded-[2rem] p-5 flex flex-col justify-between items-start h-32 card-shine">
                            <div className="w-8 h-8 rounded-full bg-surface border border-dark-border flex items-center justify-center">
                                <Zap className="w-4 h-4 text-muted" />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-primary leading-none">{birthdays.length}</p>
                                <p className="text-xs text-muted mt-1">Friends</p>
                            </div>
                        </div>
                    </div>

                    {/* LIST SECTION */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-primary">Upcoming</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-surfaceLight border border-dark-border rounded-full pl-8 pr-3 py-1.5 text-xs text-primary focus:outline-none focus:border-lime/50 transition-colors w-32 placeholder-muted"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {filteredBirthdays.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-dark-border rounded-2xl">
                                    <p className="text-muted text-sm">No birthdays found.</p>
                                </div>
                            ) : (
                                filteredBirthdays.map((birthday) => {
                                    const days = calculateDaysUntil(birthday.birthDate);
                                    const isUrgent = days <= 7;
                                    
                                    return (
                                        <div 
                                            key={birthday.id}
                                            onClick={() => handleEdit(birthday.id)}
                                            className="group flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-3xl hover:border-lime/30 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden"
                                        >
                                            {/* Hover Glow */}
                                            <div className="absolute inset-0 bg-lime/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 rounded-full bg-surfaceLight border border-dark-border flex items-center justify-center text-xl">
                                                    {birthday.emoji || '👤'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary text-[15px]">{birthday.name}</h4>
                                                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                                                        {formatDateFriendly(birthday.birthDate)}
                                                        <span className="w-1 h-1 rounded-full bg-muted"></span>
                                                        {birthday.relationship || 'Friend'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                {days === 0 ? (
                                                    <div className="px-3 py-1 bg-lime text-black text-xs font-bold rounded-full animate-pulse">
                                                        TODAY
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-right">
                                                        <div>
                                                            <span className={`block text-lg font-bold leading-none ${isUrgent ? 'text-lime' : 'text-primary'}`}>
                                                                {days}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted uppercase -rotate-90 origin-center translate-y-0.5">
                                                            Days
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    
                    {/* Bottom Spacer for Dock */}
                    <div className="h-20"></div>
                </>
            )}

            {view === 'list' && (
                <CalendarView birthdays={birthdays} />
            )}

            {view === 'reviews' && (
                <ReviewView username={username} />
            )}
            
             {view === 'settings' && (
                <div className="space-y-6 pt-4">
                    <div className="bg-dark-card border border-dark-border rounded-3xl p-6">
                         <h3 className="text-primary font-bold mb-4">Preferences</h3>
                         <div className="flex justify-between items-center py-3 border-b border-dark-border">
                             <span className="text-muted">Notifications</span>
                             <button 
                                onClick={() => {
                                    if (!notificationsEnabled) handleRequestNotification();
                                    else setNotificationsEnabled(false);
                                }}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-lime' : 'bg-surfaceLight border border-dark-border'}`}
                             >
                                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-4' : ''}`}></div>
                             </button>
                         </div>
                         
                         <div className="flex justify-between items-center py-3">
                             <span className="text-muted">Theme Mode</span>
                             <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${theme === 'dark' ? 'bg-surfaceLight border-dark-border text-white' : 'bg-white border-gray-200 text-black'}`}
                             >
                                 {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                 <span className="text-xs font-medium capitalize">{theme}</span>
                             </button>
                         </div>
                    </div>
                    
                    <div className="bg-dark-card border border-dark-border rounded-3xl p-6">
                         <h3 className="text-primary font-bold mb-4">Data</h3>
                         <button 
                            onClick={() => {
                                if (confirm('Reset all data?')) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="w-full py-4 rounded-3xl bg-surfaceLight text-red-400 font-medium border border-dark-border active:scale-[0.98] transition-transform hover:bg-red-500/5"
                        >
                            Reset All Data
                        </button>
                    </div>

                    <div className="text-center text-muted text-xs py-6 opacity-50">
                        CakeWait v1.1
                    </div>
                </div>
            )}
        </main>

        {/* Floating Glass Dock (Bottom Navigation) */}
        <div className="fixed bottom-6 left-6 right-6 z-50">
            <div className="glass-panel rounded-[2.5rem] p-2 flex justify-between items-center px-4 shadow-2xl neon-shadow transition-colors duration-300">
                <button 
                    onClick={() => setView('home')}
                    className={`p-3.5 rounded-full transition-all duration-300 ${view === 'home' ? 'bg-lime text-black translate-y-[-8px] shadow-lg shadow-lime/20' : 'text-muted hover:text-primary'}`}
                >
                    <Home size={22} strokeWidth={view === 'home' ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={`p-3.5 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-lime text-black translate-y-[-8px] shadow-lg shadow-lime/20' : 'text-muted hover:text-primary'}`}
                >
                    <CalendarIcon size={22} strokeWidth={view === 'list' ? 2.5 : 2} />
                </button>
                {/* Reviews Button */}
                <button 
                    onClick={() => setView('reviews')}
                    className={`p-3.5 rounded-full transition-all duration-300 ${view === 'reviews' ? 'bg-lime text-black translate-y-[-8px] shadow-lg shadow-lime/20' : 'text-muted hover:text-primary'}`}
                >
                    <MessageSquare size={22} strokeWidth={view === 'reviews' ? 2.5 : 2} />
                </button>
                <button 
                    onClick={() => setView('settings')}
                    className={`p-3.5 rounded-full transition-all duration-300 ${view === 'settings' ? 'bg-lime text-black translate-y-[-8px] shadow-lg shadow-lime/20' : 'text-muted hover:text-primary'}`}
                >
                    <Settings size={22} strokeWidth={view === 'settings' ? 2.5 : 2} />
                </button>
            </div>
        </div>

        {/* Modals */}
        <AddBirthdayModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleAddOrUpdate}
            initialData={editingId ? birthdays.find(b => b.id === editingId) : null}
            handleDelete={handleDelete}
        />

        <WelcomeModal 
            isOpen={isWelcomeOpen}
            initialName={username}
            initialGender={gender}
            onSave={handleSaveProfile}
            onClose={username ? () => setIsWelcomeOpen(false) : undefined} // Allow closing only if name already exists (edit mode)
        />

        {/* Popup */}
        {popupBirthdays.length > 0 && (
            <BirthdayPopup 
                birthdays={popupBirthdays} 
                onClose={() => setPopupBirthdays([])}
                onMarkCelebrated={(id) => {
                    setPopupBirthdays(prev => prev.filter(b => b.id !== id));
                }}
            />
        )}
    </div>
  );
}