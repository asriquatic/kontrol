import React, { useState, useEffect, useCallback } from 'react';
import { Fish, Sparkles, Wrench, Calendar, TrendingUp, MessageSquare, User, Wifi, CheckCircle, Home, LogOut, KeyRound, History, LayoutDashboard, ChevronDown, X, FileSpreadsheet } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc, setLogLevel } from "firebase/firestore";

// PERBAIKAN: Import CSS dihapus dari sini. Pastikan import ada di src/main.jsx saja.

// --- Helper Components ---
const Icon = ({ name, size = 20 }) => {
    switch (name) {
        case 'Fish': return <Fish size={size} />;
        case 'Sparkles': return <Sparkles size={size} />;
        case 'Wrench': return <Wrench size={size} />;
        default: return null;
    }
};

// --- Initial Data Structure ---
const createInitialBlockState = () => ({
    reviews: {
        'kondisi-ikan': '', 'kebersihan': '', 'fungsi-alat-bantu': ''
    },
    categories: [
        { id: 'kondisi-ikan', title: 'KONDISI IKAN', icon: 'Fish', sections: [ { type: 'radio', id: 'kesehatan-ikan', title: 'A. Kesehatan Ikan', selectedValue: null, items: [{ id: 'sehat', text: 'Sehat' }, { id: 'tidak-sehat', text: 'Tidak Sehat' }] }, { type: 'radio', id: 'nafsu-makan', title: 'B. Nafsu Makan', selectedValue: null, items: [{ id: 'bagus', text: 'Bagus' }, { id: 'kurang-bagus', text: 'Kurang Bagus' }] }, { type: 'radio', id: 'gerakan-ikan', title: 'C. Gerakan Ikan', selectedValue: null, items: [{ id: 'gesit', text: 'Gesit' }, { id: 'lambat', text: 'Lambat' }, { id: 'mojok', text: 'Mojok' }] }, { type: 'radio', id: 'kondisi-ikan-state', title: 'D. Kondisi Ikan', selectedValue: null, items: [{ id: 'bertelur', text: 'Bertelur' }, { id: 'menetas', text: 'Menetas' }, { id: 'gendong', text: 'Gendong' }, { id: 'kosong', text: 'Kosong' }] }, { type: 'radio', id: 'pakan', title: 'E. Pakan', selectedValue: null, items: [{ id: 'normal', text: 'Normal' }, { id: 'puasa', text: 'Puasa' }] }, ] },
        { id: 'kebersihan', title: 'KEBERSIHAN', icon: 'Sparkles', sections: [
            { type: 'triState', id: 'aquarium-indukan', title: 'A. Aquarium Indukan', items: [
                { id: 'kaca-depan', text: 'Kaca Depan', status: null }, // null, 'checked', 'crossed'
                { id: 'kaca-belakang', text: 'Kaca Belakang', status: null },
                { id: 'kaca-kiri', text: 'Kaca Samping Kiri', status: null },
                { id: 'kaca-kanan', text: 'Kaca Samping Kanan', status: null }
            ]},
            { type: 'radio', id: 'air', title: 'B. Air', selectedValue: null, items: [{ id: 'jernih', text: 'Jernih' }, { id: 'sedang', text: 'Sedang' }, { id: 'keruh', text: 'Keruh' }] },
            { type: 'radio', id: 'selang-sipon-kebersihan', title: 'C. Selang Sipon', selectedValue: null, items: [{ id: 'bersih', text: 'Bersih' }, { id: 'sedang-kotor', text: 'Sedang' }, { id: 'kotor', text: 'Kotor' }] },
            { type: 'radio', id: 'cone', title: 'D. Cone', selectedValue: null, items: [{ id: 'cone-bersih', text: 'Bersih' }, { id: 'cone-tidak-bersih', text: 'Tidak Bersih' }] },
        ]},
        { id: 'fungsi-alat-bantu', title: 'FUNGSI ALAT BANTU', icon: 'Wrench', sections: [ { type: 'radio', id: 'selang-sipon-fungsi', title: 'A. Selang Sipon', selectedValue: null, items: [{ id: 'berfungsi', text: 'Berfungsi' }, { id: 'tidak-berfungsi', text: 'Tidak Berfungsi' }] }, { type: 'radio', id: 'selang-aerator', title: 'B. Selang Aerator', selectedValue: null, items: [{ id: 'besar', text: 'Besar' }, { id: 'sedang-aerator', text: 'Sedang' }, { id: 'kecil', text: 'Kecil' }] }, { type: 'radio', id: 'aquarium-fungsi', title: 'C. Aquarium', selectedValue: null, items: [{ id: 'ada-berfungsi', text: 'Ada & Berfungsi' }, { id: 'ada-bocor', text: 'Ada & Bocor' }, { id: 'ada-pecah', text: 'Ada & Pecah' }, { id: 'ada-tidak-berfungsi', text: 'Ada & Tidak Berfungsi' }] }, ] }
    ]
});

const BLOCKS = {
    'BLOK C': { total: 300 }, 'BLOK EF': { total: 139 }, 'BLOK EP': { total: 174 }, 'BLOK F': { total: 318 }, 'KARANTINA': { total: 100 },
};

const ADMIN_EMAIL = "admin@kontrol.com";
const ADMIN_PASSWORD = "securepassword123";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDHQ-_WPqutBgUTSwpu-JyB6zQ1bT38V0M", 
    authDomain: "asriquatic-apps.firebaseapp.com",
    projectId: "asriquatic-apps",
    storageBucket: "asriquatic-apps.firebasestorage.app",
    messagingSenderId: "644786284064",
    appId: "1:644786284064:web:5f3246fb9db06dd8357e45"
};

const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleLogin = (e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError('');
        
        // Simulasikan login admin lokal
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) { 
            setTimeout(() => onLoginSuccess(), 500);
        } else { 
            setTimeout(() => { 
                setError('Email atau Password salah.'); 
                setLoading(false); 
            }, 500); 
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <KeyRound className="mx-auto text-blue-600 mb-2" size={48} />
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Login</h1>
                    <p className="text-gray-500 mt-2">Masuk untuk mengakses Kartu Kontrol.</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="admin@kontrol.com" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••••" required />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const HistoryPage = ({ checklistData }) => {
    const [activeBlock, setActiveBlock] = useState('BLOK C');
    const [expandedAquarium, setExpandedAquarium] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    
    const blockData = checklistData[activeBlock] || {};
    const aquariumKeys = Object.keys(blockData).sort((a, b) => parseInt(a) - parseInt(b));
    
    const toggleAquarium = (key) => { setExpandedAquarium(prev => (prev === key ? null : key)); };
    
    const handleExport = () => {
        setIsExporting(true);
        
        // Data Transformation for Excel
        const exportData = aquariumKeys.map(key => {
            const aquariumData = blockData[key];
            const row = { 'Blok': activeBlock, 'Aquarium': key, };
            
            aquariumData.categories.forEach(category => {
                category.sections.forEach(section => {
                    if (section.type === 'radio') { 
                        const selectedItem = section.items.find(item => item.id === section.selectedValue); 
                        // MENGAMBIL NILAI YANG DIPILIH
                        row[section.title] = selectedItem ? selectedItem.text : '';
                    } else if (section.type === 'triState') {
                        section.items.forEach(item => {
                            let status = '';
                            if (item.status === 'checked') status = '✅';
                            if (item.status === 'crossed') status = '❌';
                            row[item.text] = status;
                        });
                    }
                });
                row[`Ulasan ${category.title}`] = aquariumData.reviews[category.id] || '';
            });
            return row;
        });

        // Load SheetJS dynamically
        const loadScript = (src, callback) => {
            const script = document.createElement('script'); 
            script.src = src; 
            script.onload = callback; 
            document.body.appendChild(script);
        };
        
        loadScript("https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js", () => {
            // @ts-ignore
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            // @ts-ignore
            const workbook = XLSX.utils.book_new();
            // @ts-ignore
            XLSX.utils.book_append_sheet(workbook, worksheet, activeBlock);
            const today = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
            // @ts-ignore
            XLSX.writeFile(workbook, `Laporan Kontrol ${activeBlock} - ${today}.xlsx`);
            setIsExporting(false);
        });
    };
    
    return ( 
        <div className="max-w-7xl mx-auto"> 
            <div className="mb-6 p-4 bg-white rounded-xl shadow-md flex flex-col sm:flex-row gap-4 items-center"> 
                <div className="flex-grow w-full"> 
                    <h2 className="text-lg font-bold mb-2">Pilih Blok untuk Melihat Riwayat</h2> 
                    <select value={activeBlock} onChange={(e) => { setActiveBlock(e.target.value); setExpandedAquarium(null); }} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"> 
                        {Object.keys(BLOCKS).map(blockName => (
                            <option key={blockName} value={blockName}>{blockName}</option>
                        ))} 
                    </select> 
                </div> 
                <button onClick={handleExport} disabled={isExporting || aquariumKeys.length === 0} className="w-full sm:w-auto mt-2 sm:mt-8 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"> 
                    <FileSpreadsheet size={18} /> 
                    {isExporting ? 'Mengekspor...' : 'Ekspor ke Excel'} 
                </button> 
            </div> 
            <div className="space-y-3"> 
                {aquariumKeys.length > 0 ? ( 
                    aquariumKeys.map(key => { 
                        const aquariumData = blockData[key]; 
                        const isExpanded = expandedAquarium === key; 
                        let totalSections = 0, completedSections = 0; 
                        
                        aquariumData.categories.forEach(cat => { 
                            totalSections += cat.sections.length; 
                            completedSections += cat.sections.filter(s => { 
                                if (s.type === 'triState') return s.items.some(i => i.status !== null); 
                                return !!s.selectedValue; 
                            }).length; 
                        }); 
                        const completion = totalSections > 0 ? ((completedSections / totalSections) * 100).toFixed(0) : 0; 
                        
                        return ( 
                            <div key={key} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300"> 
                                <button onClick={() => toggleAquarium(key)} className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"> 
                                    <span className="font-bold text-lg text-blue-800">Aquarium #{key}</span> 
                                    <div className="flex items-center gap-4"> 
                                        <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">{completion}% Selesai</span> 
                                        <ChevronDown className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /> 
                                    </div> 
                                </button> 
                                {isExpanded && ( 
                                    <div className="p-6 border-t bg-gray-50 space-y-4"> 
                                        {aquariumData.categories.map(category => ( 
                                            <div key={category.id} className="p-4 bg-white rounded-lg shadow-sm"> 
                                                <h3 className="font-bold text-lg mb-2 flex items-center text-gray-800"><Icon name={category.icon} /> <span className="ml-2">{category.title}</span></h3> 
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm"> 
                                                    {category.sections.map(section => { 
                                                        if (section.type === 'triState') { 
                                                            return ( 
                                                                <div key={section.id} className="sm:col-span-2"> 
                                                                    <span className="text-gray-600 font-semibold">{section.title}:</span> 
                                                                    <div className="pl-4 mt-1 space-y-1"> 
                                                                        {section.items.map(item => { 
                                                                            let statusIcon = '➖'; 
                                                                            if (item.status === 'checked') statusIcon = '✅'; 
                                                                            if (item.status === 'crossed') statusIcon = '❌'; 
                                                                            return ( 
                                                                                <div key={item.id} className="flex justify-between"> 
                                                                                    <span className="text-gray-500">{item.text}</span> 
                                                                                    <span className="font-bold">{statusIcon}</span> 
                                                                                </div> 
                                                                            ) 
                                                                        })} 
                                                                    </div> 
                                                                </div> 
                                                            ); 
                                                        } else { 
                                                            const selectedItem = section.items.find(item => item.id === section.selectedValue); 
                                                            return ( 
                                                                <div key={section.id} className="flex justify-between border-b py-1"> 
                                                                    <span className="text-gray-600">{section.title}:</span> 
                                                                    <span className="font-semibold text-gray-900">{selectedItem ? selectedItem.text : 'Belum diisi'}</span> 
                                                                </div> 
                                                            ); 
                                                        } 
                                                    })} 
                                                </div> 
                                                {aquariumData.reviews[category.id] && ( 
                                                    <div className="mt-3 p-2 bg-blue-50 rounded-md"> 
                                                        <p className="text-sm text-blue-900"><span className="font-bold">Catatan:</span> {aquariumData.reviews[category.id]}</p> 
                                                    </div> 
                                                )} 
                                            </div> 
                                        ))} 
                                    </div> 
                                )} 
                            </div> 
                        ) 
                    }) 
                ) : ( 
                    <div className="text-center p-10 bg-white rounded-2xl shadow-md">
                        <Home size={48} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">Tidak Ada Riwayat</h2>
                        <p className="text-gray-500 mt-2">Belum ada data kontrol yang tersimpan untuk blok ini.</p>
                    </div> 
                )} 
            </div> 
        </div> 
    );
};

const ChecklistApp = ({ checklistData, setChecklistData }) => {
    const [activeBlock, setActiveBlock] = useState('BLOK C');
    const [selectedAquarium, setSelectedAquarium] = useState(null);
    
    const handleBlockChange = (blockName) => { 
        setActiveBlock(blockName); 
        setSelectedAquarium(null); 
    };
    
    const handleAquariumSelectionChange = (e) => {
        const numValue = e.target.value; 
        if (!numValue) { 
            setSelectedAquarium(null); 
            return; 
        }
        const num = parseInt(numValue, 10); 
        setSelectedAquarium(num);
        
        // Inisialisasi state baru jika belum ada
        if (!checklistData[activeBlock] || !checklistData[activeBlock][num]) {
            setChecklistData(prevData => { 
                const newData = JSON.parse(JSON.stringify(prevData)); 
                if (!newData[activeBlock]) { 
                    newData[activeBlock] = {}; 
                } 
                newData[activeBlock][num] = createInitialBlockState(); 
                return newData; 
            });
        }
    };
    
    const handleOptionChange = (categoryId, sectionId, value) => {
        setChecklistData(prevData => { 
            const newData = JSON.parse(JSON.stringify(prevData)); 
            const section = newData[activeBlock][selectedAquarium].categories.find(c => c.id === categoryId).sections.find(s => s.id === sectionId); 
            section.selectedValue = value; 
            return newData; 
        });
    };
    
    const handleTriStateChange = (categoryId, sectionId, itemId, newStatus) => {
        setChecklistData(prevData => { 
            const newData = JSON.parse(JSON.stringify(prevData)); 
            const section = newData[activeBlock][selectedAquarium].categories.find(c => c.id === categoryId).sections.find(s => s.id === sectionId); 
            const item = section.items.find(i => i.id === itemId); 
            item.status = item.status === newStatus ? null : newStatus; 
            return newData; 
        });
    };
    
    const handleReviewChange = (categoryId, event) => {
        const { value } = event.target;
        setChecklistData(prevData => { 
            const newData = JSON.parse(JSON.stringify(prevData)); 
            newData[activeBlock][selectedAquarium].reviews[categoryId] = value; 
            return newData; 
        });
    };
    
    // PERBAIKAN: Mengubah handleAutoFill menjadi handleSaveCategory
    const handleSaveCategory = () => {
        // Mencegah error alert() di lingkungan terbatas
        console.log('Data Kategori disimpan. Perubahan akan tersinkronisasi dalam 1.5 detik.');
    };
    
    const calculateCompletion = (category) => {
        if (!category) return 0;
        const totalSections = category.sections.length;
        
        const completedSections = category.sections.filter(s => {
            if (s.type === 'triState') return s.items.some(i => i.status !== null);
            return s.selectedValue !== null;
        }).length;
        
        return totalSections > 0 ? ((completedSections / totalSections) * 100).toFixed(0) : 0;
    };
    
    const activeAquariumData = checklistData[activeBlock]?.[selectedAquarium];
    
    return ( 
        <div className="max-w-7xl mx-auto"> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"> 
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <h2 className="text-lg font-bold mb-2">1. Pilih Blok</h2>
                    <select value={activeBlock} onChange={(e) => handleBlockChange(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        {Object.keys(BLOCKS).map(blockName => (
                            <option key={blockName} value={blockName}>
                                {blockName} ({BLOCKS[blockName].total})
                            </option>
                        ))}
                    </select>
                </div> 
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <h2 className="text-lg font-bold mb-2">2. Pilih Nomor Aquarium</h2>
                    <select value={selectedAquarium || ''} onChange={handleAquariumSelectionChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Pilih Nomor --</option>
                        {Array.from({ length: BLOCKS[activeBlock].total }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                                Aquarium {num}
                            </option>
                        ))}
                    </select>
                </div> 
            </div> 
            
            {selectedAquarium && activeAquariumData ? (
                <div>
                    <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl shadow-md font-bold text-center text-lg">
                        Anda sedang mengontrol: {activeBlock} - Aquarium #{selectedAquarium}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeAquariumData.categories.map((category) => (
                            <div key={category.id} className="bg-white p-6 rounded-3xl shadow-lg border flex flex-col">
                                
                                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white mr-3 shadow-md">
                                            <Icon name={category.icon} />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                                    </div>
                                    <div className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        <TrendingUp className="text-green-500 mr-1" size={16} />
                                        <span>{calculateCompletion(category)}%</span>
                                    </div>
                                </div>
                                
                                <div className="flex-grow">
                                    {category.sections.map((section) => (
                                        <div key={section.id} className="mb-4">
                                            <h3 className="text-md font-semibold text-gray-700 mb-2">{section.title}</h3> 
                                            
                                            {section.type === 'triState' ? ( 
                                                <div className="space-y-2"> 
                                                    {section.items.map((item) => ( 
                                                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50"> 
                                                            <span className={`text-sm font-medium ${item.status !== null ? 'text-gray-900' : 'text-gray-500'}`}>{item.text}</span> 
                                                            <div className="flex gap-2"> 
                                                                <button onClick={() => handleTriStateChange(category.id, section.id, item.id, 'checked')} className={`p-1 rounded-md transition-colors ${item.status === 'checked' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-200'}`}>
                                                                    <CheckCircle size={20} />
                                                                </button> 
                                                                <button onClick={() => handleTriStateChange(category.id, section.id, item.id, 'crossed')} className={`p-1 rounded-md transition-colors ${item.status === 'crossed' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-200'}`}>
                                                                    <X size={20} />
                                                                </button> 
                                                            </div> 
                                                        </div> 
                                                    ))} 
                                                </div> 
                                            ) : section.type === 'radio' ? ( 
                                                <div className="flex flex-wrap gap-2">
                                                    {section.items.map((item) => (
                                                        <label key={item.id} className="flex-grow">
                                                            <input type="radio" name={`${activeBlock}-${selectedAquarium}-${category.id}-${section.id}`} value={item.id} checked={section.selectedValue === item.id} onChange={() => handleOptionChange(category.id, section.id, item.id)} className="sr-only peer" />
                                                            <div className="w-full text-center p-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:shadow-md bg-gray-100 hover:bg-gray-200 text-gray-800">
                                                                {item.text}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div> 
                                            ) : null} 
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-auto pt-4 border-t">
                                    <button onClick={handleSaveCategory} className="w-full flex items-center justify-center gap-2 mb-4 p-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm">
                                        <CheckCircle size={18} />Simpan Kategori
                                    </button>
                                    <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                                        <MessageSquare size={18} className="mr-2 text-blue-500" />Ulasan & Catatan
                                    </h3>
                                    <textarea value={activeAquariumData.reviews[category.id] || ''} onChange={(e) => handleReviewChange(category.id, e)} placeholder="Tulis ulasan atau catatan di sini..." className="w-full p-2 border rounded-lg text-sm bg-gray-50" rows="3"></textarea>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center p-10 bg-white rounded-2xl shadow-md">
                    <Home size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Silakan Pilih Blok dan Nomor Aquarium</h2>
                    <p className="text-gray-500 mt-2">Pilih blok dan nomor aquarium di atas untuk memulai kontrol.</p>
                </div>
            )} 
        </div> 
    );
};

export default App;
