import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'visitor_name';

export const useVisitorStore = defineStore('visitor', () => {
    // Initialize from localStorage if available
    const initialName = typeof window !== 'undefined' 
        ? localStorage.getItem(STORAGE_KEY) || '' 
        : '';
    
    const visitorName = ref<string>(initialName);

    function setVisitorName(name: string) {
        visitorName.value = name;
        // Persist to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, name);
            console.log('✅ Visitor name saved to localStorage:', name);
        }
    }

    function clearVisitor() {
        visitorName.value = '';
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            console.log('✅ Visitor name cleared from localStorage');
        }
    }

    return {
        visitorName,
        setVisitorName,
        clearVisitor
    };
});
