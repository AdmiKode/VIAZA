import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
   DUOTONE ICONS
   Activo   → blanco puro (sobre bubble #EA9940)
   Inactivo → blanco 42% (sobre pill #12212E)
   Técnica: forma sólida + overlay glass translúcido encima.
───────────────────────────────────────────────────────────────────────── */

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
      <path d="M6 22L24 6l18 16v20a2 2 0 0 1-2 2H30V30H18v12H8a2 2 0 0 1-2-2z"
        fill="white" fillOpacity={active ? 1 : 0.42} />
      <path d="M6 22L24 6l9 8.5" fill="white" fillOpacity={active ? 0.35 : 0.16} />
      <rect x="19" y="30" width="10" height="12" rx="2" fill="white" fillOpacity={active ? 0.25 : 0} />
    </svg>
  );
}

function IconPacking({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="18" width="32" height="24" rx="7" fill="white" fillOpacity={active ? 1 : 0.42} />
      <rect x="8" y="18" width="32" height="11" rx="7" fill="white" fillOpacity={active ? 0.30 : 0.15} />
      <path d="M18 18v-4a6 6 0 0 1 12 0v4"
        stroke="white" strokeOpacity={active ? 1 : 0.42} strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function IconTools({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
      <path d="M34 6a10 10 0 0 0-10 11.2L8.3 33.5a4.24 4.24 0 1 0 6 6L30.8 24A10 10 0 1 0 34 6z"
        fill="white" fillOpacity={active ? 1 : 0.42} />
      <circle cx="34" cy="14" r="7" fill="white" fillOpacity={active ? 0.28 : 0.14} />
      <circle cx="34" cy="14" r="3" fill="white" fillOpacity={active ? 0.50 : 0} />
    </svg>
  );
}

function IconTips({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
      <path d="M24 6a13 13 0 0 1 8 23.1V34a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2v-4.9A13 13 0 0 1 24 6z"
        fill="white" fillOpacity={active ? 1 : 0.42} />
      <ellipse cx="20" cy="14" rx="5" ry="6" fill="white" fillOpacity={active ? 0.30 : 0.15} />
      <rect x="18" y="36" width="12" height="4" rx="2" fill="white" fillOpacity={active ? 1 : 0.42} />
      <rect x="19.5" y="41" width="9" height="3" rx="1.5" fill="white" fillOpacity={active ? 0.70 : 0.30} />
    </svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
      <path d="M24 4l-3 5.4A14 14 0 0 0 15 12L9 10.2l-5 8.6 4.6 3.7a14.4 14.4 0 0 0 0 3l-4.6 3.7 5 8.6L15 36a14 14 0 0 0 6 2.6L24 44l3-5.4A14 14 0 0 0 33 36l6 1.8 5-8.6-4.6-3.7a14.4 14.4 0 0 0 0-3l4.6-3.7-5-8.6L33 12a14 14 0 0 0-6-2.6z"
        fill="white" fillOpacity={active ? 1 : 0.42} />
      <circle cx="24" cy="24" r="7" fill="white" fillOpacity={active ? 0.28 : 0.14} />
    </svg>
  );
}

const ITEMS = [
  { to: '/home',     labelKey: 'nav.home',     Icon: IconHome     },
  { to: '/packing',  labelKey: 'nav.packing',  Icon: IconPacking  },
  { to: '/tools',    labelKey: 'nav.tools',    Icon: IconTools    },
  { to: '/tips',     labelKey: 'nav.tips',     Icon: IconTips     },
  { to: '/settings', labelKey: 'nav.settings', Icon: IconSettings },
];

/* ─────────────────────────────────────────────────────────────────────────
   BOTTOM NAV COMPONENT
   Pill #12212E flotante. Tab activo: bubble #EA9940 emerge hacia arriba.
───────────────────────────────────────────────────────────────────────── */
export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className="flex items-end rounded-[32px]"
        style={{
          background: '#12212E',
          boxShadow: '0 8px 32px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.20)',
        }}
      >
        {ITEMS.map(({ to, labelKey, Icon }) => {
          const isActive =
            location.pathname === to ||
            (to === '/home' && location.pathname === '/');

          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center"
            >
              {isActive ? (
                <motion.div
                  layoutId="nav-bubble"
                  className="flex flex-col items-center"
                  style={{ marginTop: -20 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                >
                  {/* Anillo del mismo color del pill para crear "gap" visual */}
                  <div style={{ background: '#12212E', borderRadius: '50%', padding: 4 }}>
                    {/* Bubble naranja accent */}
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 54,
                        height: 54,
                        background: '#EA9940',
                        boxShadow: '0 4px 20px rgba(234,153,64,0.55)',
                      }}
                    >
                      <Icon active={true} />
                    </div>
                  </div>
                  <span
                    className="font-bold tracking-wide"
                    style={{ fontSize: 10, color: '#EA9940', marginTop: 4, marginBottom: 8 }}
                  >
                    {t(labelKey)}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center" style={{ paddingTop: 14, paddingBottom: 14 }}>
                  <Icon active={false} />
                  <span
                    className="font-semibold"
                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}
                  >
                    {t(labelKey)}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
