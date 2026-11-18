import { AuthProvider } from './app/providers/AuthProvider';
import { CartProvider } from './app/providers/CartProvider';
import { AppRouter } from './app/router/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
