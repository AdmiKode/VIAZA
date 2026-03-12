import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = window.setTimeout(() => navigate('/intro', { replace: true }), 2400);
    return () => window.clearTimeout(handle);
  }, [navigate]);

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
      style={{ background: '#12212E' }}
    >
      {/* ── Círculos decorativos de fondo ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(48,112,130,0.22) 0%, transparent 70%)',
          top: -80,
          right: -100,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,153,64,0.12) 0%, transparent 70%)',
          bottom: -60,
          left: -80,
        }}
      />

      {/* ── Escena animada central ── */}
      <div className="relative flex flex-col items-center">

        {/* Ruta punteada — aparece primero */}
        <motion.svg
          width="220" height="80" viewBox="0 0 220 80" fill="none"
          className="mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* línea curva punteada de pin a avión */}
          <motion.path
            d="M 30 65 Q 110 10 190 30"
            stroke="rgba(234,153,64,0.45)"
            strokeWidth="2"
            strokeDasharray="6 5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, delay: 0.5, ease: 'easeInOut' }}
          />

          {/* PIN izquierda */}
          <motion.g
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            {/* sombra/base naranja */}
            <ellipse cx="30" cy="72" rx="9" ry="3" fill="rgba(234,153,64,0.25)" />
            {/* cuerpo del pin */}
            <path
              d="M30 22 C22 22 16 28 16 36 C16 46 30 62 30 62 C30 62 44 46 44 36 C44 28 38 22 30 22z"
              fill="#EA9940"
            />
            {/* overlay glass gris encima */}
            <path
              d="M30 22 C22 22 16 28 16 36 C16 40 22 48 30 56"
              fill="rgba(180,190,200,0.35)"
            />
            {/* punto interior */}
            <circle cx="30" cy="36" r="6" fill="rgba(255,255,255,0.5)" />
          </motion.g>

          {/* AVIÓN derecha — aparece después de la ruta */}
          <motion.g
            initial={{ opacity: 0, x: -20, scale: 0.6 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 1.3, type: 'spring', stiffness: 260 }}
          >
            {/* cuerpo avión — base naranja */}
            <path
              d="M190 22 L210 30 L190 38 L194 30 Z"
              fill="#EA9940"
            />
            {/* ala superior — glass gris */}
            <path
              d="M194 28 L204 20 L205 24 L197 29 Z"
              fill="rgba(180,190,200,0.60)"
            />
            {/* ala inferior — glass gris */}
            <path
              d="M194 32 L204 40 L205 36 L197 31 Z"
              fill="rgba(180,190,200,0.45)"
            />
          </motion.g>
        </motion.svg>

        {/* ── Logo VIAZA ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.8 }}
          className="flex items-center justify-center"
        >
          <img
            src="/brand/logo-white.png"
            alt="VIAZA"
            style={{ height: 52, width: 'auto' }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          style={{
            color: 'rgba(236,231,220,0.65)',
            fontSize: 14,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginTop: 10,
            fontFamily: 'Questrial, sans-serif',
          }}
        >
          Smart Travel Companion
        </motion.p>
      </div>

      {/* ── Loader dots ── */}
      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA9940' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
