import { createBrowserRouter } from 'react-router-dom';

import {
    LandingPage, PricingPage, SignUpPage,
    SignInPage, ForgotPasswordPage, ResetPasswordPage, RestoreAccountPage, RestoreAccountFinalPage, DeleteAccountPage, CheckMailPage, VerifyEmailPage, TwoFactorPage, AboutUsPage, FeaturesPage,
    ContactUsPage, HowItWorksPage, OurStoryPage, PrivacyPage,
    LockedInPage, UpgradePage, StudyPlanPage, ScholarPage, SprintPage, LibraryPage,
    BillingPage, ProfileSettingsPage, ChangePasswordPage, ApplicationSettingsPage,
    NotificationsPage, HelpSupportPage, SupportTicketsPage, NewSupportTicketsPage, SupportTicketPage
} from '../pages/pages';
import NotePage from '../pages/NotePage';
import PaperPage from '../pages/PaperPage';
import PresentationPage from '../pages/PresentationPage';
import FolderPage from '../pages/FolderPage';
import FlashcardPage from '../pages/FlashcardPage';
import VoiceToSpeechPage from '../pages/VoiceToSpeechPage';
import GeneratePage from '../pages/GeneratePage';
import QuizzesPage from '../pages/QuizzesPage';
import QuizCreatePage from '../pages/QuizCreatePage';
import QuizPlayPage from '../pages/QuizPlayPage';
import PublicQuizPage from '../pages/PublicQuizPage';
import SprintCreatePage from '../pages/SprintCreatePage';
import SprintDetailPage from '../pages/SprintDetailPage';
import SprintChallengePage from '../pages/SprintChallengePage';
import PaymentCallbackPage from '../pages/PaymentCallbackPage';
import ScrollToTop from './ScrollToTop';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';

const AppRoutes = createBrowserRouter([
    {
        path: '/',
        element: <ScrollToTop>
            <LandingPage />
        </ScrollToTop>
    },

    {
        path: '/pricing',
        element: <ScrollToTop>
            <PricingPage />
        </ScrollToTop>,
    },

    {
        path: '/about-us',
        element: <ScrollToTop>
            <AboutUsPage />
        </ScrollToTop>,
    },

    {
        path: '/features',
        element: <ScrollToTop>
            <FeaturesPage />
        </ScrollToTop>,
    },

    {
        path: '/contact-us',
        element: <ScrollToTop>
            <ContactUsPage />
        </ScrollToTop>,
    },

    {
        path: '/how-it-works',
        element: <ScrollToTop>
            <HowItWorksPage />
        </ScrollToTop>,
    },

    {
        path: '/our-story',
        element: <ScrollToTop>
            <OurStoryPage />
        </ScrollToTop>,
    },

    {
        path: '/privacy',
        element: <ScrollToTop>
            <PrivacyPage />
        </ScrollToTop>,
    },

    {
        path: '/help-&-support',
        element: <ScrollToTop>
            <HelpSupportPage />
        </ScrollToTop>,
    },

    {
        path: '/signup',
        element: <GuestRoute><ScrollToTop>
            <SignUpPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/signin',
        element: <GuestRoute><ScrollToTop>
            <SignInPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/forgot-password',
        element: <GuestRoute><ScrollToTop>
            <ForgotPasswordPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/forgot-password/token',
        element: <GuestRoute><ScrollToTop>
            <ResetPasswordPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/forgot-password/check-email',
        element: <GuestRoute><ScrollToTop>
            <CheckMailPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/restore-account',
        element: <GuestRoute><ScrollToTop>
            <RestoreAccountPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/account-restore/token',
        element: <GuestRoute><ScrollToTop>
            <RestoreAccountFinalPage />
        </ScrollToTop></GuestRoute>,
    },
    {
        path: '/verify/email/:token',
        element: <ScrollToTop>
            <VerifyEmailPage />
        </ScrollToTop>,
    },
    {
        path: '/auth/2fa',
        element: <GuestRoute><ScrollToTop>
            <TwoFactorPage />
        </ScrollToTop></GuestRoute>,
    },

    // user (protected — require valid in-memory token)

    {
        path: '/lockedin',
        element: <ProtectedRoute><ScrollToTop>
            <LockedInPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/library',
        element: <ProtectedRoute><ScrollToTop>
            <LibraryPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/upgrade',
        element: <ProtectedRoute><ScrollToTop>
            <UpgradePage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/scholar',
        element: <ProtectedRoute><ScrollToTop>
            <ScholarPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/sprints',
        element: <ProtectedRoute><ScrollToTop>
            <SprintPage />
        </ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/sprints/create',
        element: <ProtectedRoute><ScrollToTop>
            <SprintCreatePage />
        </ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/sprints/:id',
        element: <ProtectedRoute><ScrollToTop>
            <SprintDetailPage />
        </ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/sprints/:sprintId/challenges/:challengeId',
        element: <ProtectedRoute><ScrollToTop>
            <SprintChallengePage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/study-plan',
        element: <ProtectedRoute><ScrollToTop>
            <StudyPlanPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/invoices-&-billing',
        element: <ProtectedRoute><ScrollToTop>
            <BillingPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/delete-account',
        element: <ProtectedRoute><ScrollToTop>
            <DeleteAccountPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/profile-settings',
        element: <ProtectedRoute><ScrollToTop>
            <ProfileSettingsPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/change-password',
        element: <ProtectedRoute><ScrollToTop>
            <ChangePasswordPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/application-settings',
        element: <ProtectedRoute><ScrollToTop>
            <ApplicationSettingsPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/notifications',
        element: <ProtectedRoute><ScrollToTop>
            <NotificationsPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/support-tickets',
        element: <ProtectedRoute><ScrollToTop>
            <SupportTicketsPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/support-tickets/new',
        element: <ProtectedRoute><ScrollToTop>
            <NewSupportTicketsPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/support-tickets/show/:id',
        element: <ProtectedRoute><ScrollToTop>
            <SupportTicketPage />
        </ScrollToTop></ProtectedRoute>,
    },

    {
        path: '/lockedin/folders/:id',
        element: <ProtectedRoute><ScrollToTop><FolderPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/voice-to-speech',
        element: <ProtectedRoute><ScrollToTop><VoiceToSpeechPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/generate',
        element: <ProtectedRoute><ScrollToTop><GeneratePage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/notes/new',
        element: <ProtectedRoute><ScrollToTop><NotePage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/notes/:id',
        element: <ProtectedRoute><ScrollToTop><NotePage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/papers/new',
        element: <ProtectedRoute><ScrollToTop><PaperPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/papers/:id',
        element: <ProtectedRoute><ScrollToTop><PaperPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/presentations/:id',
        element: <ProtectedRoute><ScrollToTop><PresentationPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/flashcards/new',
        element: <ProtectedRoute><ScrollToTop><FlashcardPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/flashcards/:id',
        element: <ProtectedRoute><ScrollToTop><FlashcardPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/quizzes',
        element: <ProtectedRoute><ScrollToTop><QuizzesPage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/quizzes/new',
        element: <ProtectedRoute><ScrollToTop><QuizCreatePage /></ScrollToTop></ProtectedRoute>,
    },
    {
        path: '/lockedin/quizzes/:id/play',
        element: <ProtectedRoute><ScrollToTop><QuizPlayPage /></ScrollToTop></ProtectedRoute>,
    },

    // Public quiz — accessible without login
    {
        path: '/quiz/:id',
        element: <ScrollToTop><PublicQuizPage /></ScrollToTop>,
    },

    // Payment callback — Paystack redirects here after checkout
    {
        path: '/payment/callback',
        element: <ProtectedRoute><ScrollToTop><PaymentCallbackPage /></ScrollToTop></ProtectedRoute>,
    },

]);

export default AppRoutes;