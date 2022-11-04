import { Signal, useSignal } from "@preact/signals-react";

export default function useLocalStorageState<T>(key: string, initialValue: T): [Signal<T>, (val: T) => void] {
    const isClient = typeof window !== "undefined";

    const getStoredValue = () => {
        if (isClient) {
            return localStorage.getItem(key);
        }

        return null;
    };

    const setValue = (newValue: T) => {
        stateValue.value = newValue;

        if (isClient) {
            localStorage.setItem(key, JSON.stringify(newValue));
        }
    };

    const localStorageValue = getStoredValue();
    const stateValue = useSignal<T>(localStorageValue ? JSON.parse(localStorageValue) : initialValue);

    return [stateValue, setValue];
}
