import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wifi, User, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl border border-cyan-400/50 p-8 shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-gray-800/50 rounded-t-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/60 text-sm ml-2 font-mono">NAVE_TERMINAL_v2.0</span>
          </div>

          {/* Wifi icon and title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Wifi className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-cyan-400 text-xl font-bold mb-2">ACESSO SEGURO</h2>
            <p className="text-white/60 text-sm">Acesse com seu usuário da UM</p>
          </div>

          {/* Login form */}
          <div className="space-y-6">
            {/* Username field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <Label htmlFor="username" className="text-cyan-400 text-sm font-medium">
                  Login
                </Label>
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                className="bg-gray-800/50 border-cyan-400/30 text-white placeholder-white/40 focus:border-cyan-400 focus:ring-cyan-400/50 rounded-lg"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <Label htmlFor="password" className="text-cyan-400 text-sm font-medium">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className="bg-gray-800/50 border-cyan-400/30 text-white placeholder-white/40 focus:border-cyan-400 focus:ring-cyan-400/50 rounded-lg"
              />
            </div>

            {/* Login button */}
            <Button 
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-3 rounded-lg transition-colors duration-200"
            >
              INICIALIZAR SISTEMA
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};