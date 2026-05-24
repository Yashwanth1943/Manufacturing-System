import { useContext } from 'react';
import ToastContext from './toastContextValue.js';

const useToast = () => useContext(ToastContext);

export default useToast;
