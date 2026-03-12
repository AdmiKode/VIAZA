import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { AppFrame } from './layout/AppFrame';
import { OnboardingFrame } from './layout/OnboardingFrame';
import { HomePage } from '../../modules/trips/pages/HomePage';
import { TripDetailsPage } from '../../modules/trips/pages/TripDetailsPage';
import { PackingChecklistPage } from '../../modules/packing/pages/PackingChecklistPage';
import { SettingsPage } from '../../modules/settings/pages/SettingsPage';
import { ProfilePage } from '../../modules/profile/pages/ProfilePage';
import { LoginPage } from '../../modules/auth/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/pages/RegisterPage';
import { ToolsHubPage } from '../../modules/tools/pages/ToolsHubPage';
import { TipsHubPage } from '../../modules/tips/pages/TipsHubPage';
import { TranslatorPage } from '../../modules/translator/pages/TranslatorPage';
import { QuickPhrasesPage } from '../../modules/translator/pages/QuickPhrasesPage';
import { CurrencyConverterPage } from '../../modules/currency/pages/CurrencyConverterPage';
import { SplitBillPage } from '../../modules/split-bill/pages/SplitBillPage';
import { LocalTipsPage } from '../../modules/local-tips/pages/LocalTipsPage';
import { SurvivalTipsPage } from '../../modules/survival-tips/pages/SurvivalTipsPage';
import { AirlineRulesPage } from '../../modules/airline/pages/AirlineRulesPage';
import { AllowedItemsPage } from '../../modules/airport-items/pages/AllowedItemsPage';
import { AdapterGuidePage } from '../../modules/adapters/pages/AdapterGuidePage';
import { DepartureReminderPage } from '../../modules/reminders/pages/DepartureReminderPage';
import { PremiumPage } from '../../modules/premium/pages/PremiumPage';
import { OnboardingWelcomePage } from '../../modules/onboarding/pages/OnboardingWelcomePage';
import { SplashPage } from '../../modules/onboarding/pages/SplashPage';
import { IntroPage } from '../../modules/onboarding/pages/IntroPage';
import { TravelTypePage } from '../../modules/onboarding/pages/TravelTypePage';
import { ActivitiesPage } from '../../modules/onboarding/pages/ActivitiesPage';
import { DestinationPage } from '../../modules/onboarding/pages/DestinationPage';
import { DatePickerPage } from '../../modules/onboarding/pages/DatePickerPage';
import { SmartTripDetectionPage } from '../../modules/onboarding/pages/SmartTripDetectionPage';
import { TravelersPage } from '../../modules/onboarding/pages/TravelersPage';
import { PreferencesPage } from '../../modules/onboarding/pages/PreferencesPage';
import { OnboardingSummaryPage } from '../../modules/onboarding/pages/OnboardingSummaryPage';
import { TransportPage } from '../../modules/onboarding/pages/TransportPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export function AppRouter() {
  const hasTrip = useAppStore((s) => Boolean(s.currentTripId));
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  return (
    <BrowserRouter>
      <Routes>
        {/*
         * Flujo completo:
         * / → /splash → /intro → /auth/login → /onboarding → /home
         *
         * Usuario nuevo que acaba de hacer login:
         *   isAuthenticated=true, onboardingCompleted=false → onboarding
         * Usuario que ya completó onboarding y tiene viaje:
         *   isAuthenticated=true, onboardingCompleted=true  → home
         * Usuario sin sesión:
         *   → splash
         */}
        <Route
          path="/"
          element={
            !isAuthenticated
              ? <Navigate to="/splash" replace />
              : onboardingCompleted && hasTrip
                ? <Navigate to="/home" replace />
                : <Navigate to="/onboarding/travel-type" replace />
          }
        />

        {/* ── Intro pre-auth (sin guards) ─────────────────────────── */}
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/intro" element={<IntroPage />} />

        {/* ── Auth ────────────────────────────────────────────────── */}
        <Route path="/auth">
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route
            path="login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
        </Route>

        {/* ── Onboarding (requiere auth) ───────────────────────────── */}
        <Route
          path="/onboarding"
          element={!isAuthenticated ? <Navigate to="/auth/login" replace /> : <OnboardingFrame />}
        >
          {/* index → primer paso real del onboarding */}
          <Route index element={<Navigate to="travel-type" replace />} />
          <Route path="welcome" element={<OnboardingWelcomePage />} />
          <Route path="travel-type" element={<TravelTypePage />} />
          <Route path="destination" element={<DestinationPage />} />
          <Route path="dates" element={<DatePickerPage />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="smart-detection" element={<SmartTripDetectionPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="travelers" element={<TravelersPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="summary" element={<OnboardingSummaryPage />} />
        </Route>

        <Route element={
          !isAuthenticated
            ? <Navigate to="/auth/login" replace />
            : !onboardingCompleted
              ? <Navigate to="/onboarding/travel-type" replace />
              : <AppFrame />
        }>
          <Route path="/home" element={<HomePage />} />
          <Route path="/trip/:id" element={<TripDetailsPage />} />
          <Route path="/packing" element={<PackingChecklistPage />} />
          <Route path="/tools" element={<ToolsHubPage />} />
          <Route path="/tips" element={<TipsHubPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/translator/phrases" element={<QuickPhrasesPage />} />
          <Route path="/currency" element={<CurrencyConverterPage />} />
          <Route path="/split-bill" element={<SplitBillPage />} />

          <Route path="/tips/local" element={<LocalTipsPage />} />
          <Route path="/tips/survival" element={<SurvivalTipsPage />} />

          <Route path="/airline-rules" element={<AirlineRulesPage />} />
          <Route path="/allowed-items" element={<AllowedItemsPage />} />
          <Route path="/adapters" element={<AdapterGuidePage />} />
          <Route path="/departure" element={<DepartureReminderPage />} />
          <Route path="/premium" element={<PremiumPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
