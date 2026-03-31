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
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage';
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
import { TripHistoryPage } from '../../modules/trips/pages/TripHistoryPage';
import { BusinessTripPage } from '../../modules/trips/pages/BusinessTripPage';
import { TripActivitiesPage } from '../../modules/activities/pages/TripActivitiesPage';
import { TripRoutePage } from '../../modules/trips/pages/TripRoutePage';
import { BoardingPassScannerPage } from '../../modules/airline/pages/BoardingPassScannerPage';
import { LuggageAssistantRoute } from '../../modules/packing/pages/LuggageAssistantRoute';
import { AgendaPage } from '../../modules/agenda/pages/AgendaPage';
import { NewAgendaItemPage } from '../../modules/agenda/pages/NewAgendaItemPage';
import { AgendaItemDetailPage } from '../../modules/agenda/pages/AgendaItemDetailPage';
import { ItineraryPage } from '../../modules/itinerary/pages/ItineraryPage';
import { AddEventPage } from '../../modules/itinerary/pages/AddEventPage';
import { DayDetailPage } from '../../modules/itinerary/pages/DayDetailPage';
import { PlacesPage } from '../../modules/places/pages/PlacesPage';
import { AddPlacePage } from '../../modules/places/pages/AddPlacePage';
import { PlaceDetailPage } from '../../modules/places/pages/PlaceDetailPage';
import { ImportReservationPage } from '../../modules/import-reservation/pages/ImportReservationPage';
import { RecommendationsPage } from '../../modules/recommendations/pages/RecommendationsPage';
import { WalletPage } from '../../modules/wallet/pages/WalletPage';
import { WalletLostModePage } from '../../modules/wallet/pages/WalletLostModePage';
import { LandingPage } from '../../modules/landing/pages/LandingPage';
import { PrivacyPage } from '../../modules/landing/pages/PrivacyPage';
import { TermsPage } from '../../modules/landing/pages/TermsPage';
import EmergencyCardPage from '../../modules/emergency/pages/EmergencyCardPage';
import EmergencyPublicPage from '../../modules/emergency/pages/EmergencyPublicPage';
import { SosFlowPage } from '../../modules/emergency/pages/SosFlowPage';
import { SosPublicPage } from '../../modules/emergency/pages/SosPublicPage';
import { TravelMemoryPage } from '../../modules/journal/pages/TravelMemoryPage';
import { SafeWalkPage } from '../../modules/safety/pages/SafeWalkPage';
import { LiveTrackingPage } from '../../modules/safety/pages/LiveTrackingPage';
import { SafetyHubPage } from '../../modules/safety/pages/SafetyHubPage';
import { SharedItineraryPage } from '../../modules/itinerary/pages/SharedItineraryPage';
import BudgetPage from '../../modules/finances/pages/BudgetPage';
import { HealthPage } from '../../modules/health/pages/HealthPage';
import { AirportFlowPage } from '../../modules/airport/pages/AirportFlowPage';
import { WeatherPage } from '../../modules/weather/pages/WeatherPage';

export function AppRouter() {
  const hasTrip = useAppStore((s) => Boolean(s.currentTripId));
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  return (
    <BrowserRouter>
      <Routes>
        {/*
         * Flujo completo:
         * / → landing pública → usuario pulsa "Entrar" → /splash → /intro → /auth/login → /onboarding → /home
         *
         * La landing es siempre la primera pantalla.
         * El botón "Entrar a la app" en la landing lleva a /splash.
         * Cuando terminemos el desarrollo, ese botón se elimina
         * y los botones de tienda quedan como único CTA.
         */}
        <Route path="/" element={
          isAuthenticated
            ? <Navigate to={onboardingCompleted ? '/home' : '/onboarding'} replace />
            : <LandingPage />
        } />

        {/* ── Intro pre-auth (sin guards) ─────────────────────────── */}
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/intro" element={<IntroPage />} />

        {/* ── Landing pública ─────────────────────────────────────── */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* ── SOS evento público por token (sin auth) ─────────────── */}
        <Route path="/sos/:token" element={<SosPublicPage />} />

        {/* ── Emergency Travel Card (pública, sin auth) ───────────── */}
        <Route path="/emergency/:publicToken" element={<EmergencyPublicPage />} />

        {/* ── Safe Walk: vista del acompañante (pública, sin auth) ── */}
        <Route path="/safety/view/:token" element={<LiveTrackingPage />} />

        {/* ── Itinerario compartido (público, sin auth) ───────────── */}
        <Route path="/itinerary/shared/:token" element={<SharedItineraryPage />} />

        {/* Alias para el link del email de Supabase → /reset-password?token=... */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Auth ────────────────────────────────────────────────── */}
        <Route path="/auth">
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route
            path="login"
            element={isAuthenticated ? <Navigate to={onboardingCompleted ? '/home' : '/onboarding'} replace /> : <LoginPage />}
          />
          <Route
            path="register"
            element={isAuthenticated ? <Navigate to={onboardingCompleted ? '/home' : '/onboarding'} replace /> : <RegisterPage />}
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
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
          <Route path="/history" element={<TripHistoryPage />} />
          <Route path="/business" element={<BusinessTripPage />} />
          <Route path="/activities" element={<TripActivitiesPage />} />
          <Route path="/route" element={<TripRoutePage />} />
          <Route path="/boarding-pass-scanner" element={<BoardingPassScannerPage />} />
          <Route path="/luggage-assistant" element={<LuggageAssistantRoute />} />

          {/* ── Nuevos módulos ─────────────────────────────────────── */}
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/agenda/new" element={<NewAgendaItemPage />} />
          <Route path="/agenda/:id" element={<AgendaItemDetailPage />} />
          <Route path="/itinerary" element={<ItineraryPage />} />
          <Route path="/itinerary/add-event" element={<AddEventPage />} />
          <Route path="/itinerary/day/:index" element={<DayDetailPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/add" element={<AddPlacePage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/wallet/lost" element={<WalletLostModePage />} />
          <Route path="/import-reservation" element={<ImportReservationPage />} />

          {/* ── Emergency Travel Card (privada, requiere auth) ───── */}
          <Route path="/profile/emergency" element={<EmergencyCardPage />} />

          {/* ── SOS Flow (privado, requiere auth) ───────────────── */}
          <Route path="/sos" element={<SosFlowPage />} />

          {/* ── Safety ───────────────────────────────────────────── */}
          <Route path="/safety" element={<SafetyHubPage />} />
          <Route path="/safety/safewalk" element={<SafeWalkPage />} />

          {/* ── Finances / Budget ────────────────────────────────── */}
          <Route path="/budget" element={<BudgetPage />} />

          {/* ── Travel Memory / Bitacora ─────────────────────────── */}
          <Route path="/journal" element={<TravelMemoryPage />} />
          <Route path="/memory" element={<TravelMemoryPage />} />

          {/* ── Health Module ─────────────────────────────────────── */}
          <Route path="/health" element={<HealthPage />} />

          {/* ── Airport Flow / Go Now ─────────────────────────────── */}
          <Route path="/airport-flow" element={<AirportFlowPage />} />

          {/* ── Weather Intelligence ──────────────────────────────── */}
          <Route path="/weather" element={<WeatherPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
