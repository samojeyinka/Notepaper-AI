import { createBrowserRouter } from 'react-router-dom';

import { LandingPage,PricingPage,SignUpPage,
    SignInPage,ForgotPasswordPage,ResetPasswordPage,RestoreAccountPage,RestoreAccountFinalPage,DeleteAccountPage,CheckMailPage,VerifyEmailPage,TwoFactorPage,AboutUsPage,FeaturesPage,
    ContactUsPage, HowItWorksPage,OurStoryPage,PrivacyPage,
     LockedInPage,UpgradePage, StudyPlanPage,LibraryPage,
     BillingPage,ProfileSettingsPage,ChangePasswordPage,ApplicationSettingsPage,
      NotificationsPage, HelpSupportPage,SupportTicketsPage,NewSupportTicketsPage,SupportTicketPage } from '../pages/pages';
import NotePage from '../pages/NotePage';
import ScrollToTop from './ScrollToTop';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';

const AppRoutes = createBrowserRouter([
    {
        path: '/',
        element: <ScrollToTop>
        <LandingPage/>
        </ScrollToTop>         
    },

    {
        path: '/pricing',
        element:<ScrollToTop>
        <PricingPage/>
        </ScrollToTop>,       
    },

    {
        path: '/about-us',
        element:<ScrollToTop>
        <AboutUsPage/>
        </ScrollToTop>,       
    },

     {
        path: '/features',
        element:<ScrollToTop>
        <FeaturesPage/>
        </ScrollToTop>,       
    },

      {
        path: '/contact-us',
        element:<ScrollToTop>
        <ContactUsPage/>
        </ScrollToTop>,       
    },

    {
        path: '/how-it-works',
        element:<ScrollToTop>
        <HowItWorksPage/>
        </ScrollToTop>,       
    },

     {
        path: '/our-story',
        element:<ScrollToTop>
        <OurStoryPage/>
        </ScrollToTop>,       
    },

      {
        path: '/privacy',
        element:<ScrollToTop>
        <PrivacyPage/>
        </ScrollToTop>,       
    },

    {
        path: '/help-&-support',
        element:<ScrollToTop>
        <HelpSupportPage/>
        </ScrollToTop>,       
    },

     {
        path: '/signup',
        element:<GuestRoute><ScrollToTop>
        <SignUpPage/>
        </ScrollToTop></GuestRoute>,       
    },
     {
        path: '/signin',
        element:<GuestRoute><ScrollToTop>
        <SignInPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/forgot-password',
        element:<GuestRoute><ScrollToTop>
        <ForgotPasswordPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/forgot-password/token',
        element:<GuestRoute><ScrollToTop>
        <ResetPasswordPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/forgot-password/check-email',
        element:<GuestRoute><ScrollToTop>
        <CheckMailPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/restore-account',
        element:<GuestRoute><ScrollToTop>
        <RestoreAccountPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/account-restore/token',
        element:<GuestRoute><ScrollToTop>
        <RestoreAccountFinalPage/>
        </ScrollToTop></GuestRoute>,       
    },
    {
        path: '/verify/email/:token',
        element:<ScrollToTop>
        <VerifyEmailPage/>
        </ScrollToTop>,       
    },
    {
        path: '/auth/2fa',
        element:<GuestRoute><ScrollToTop>
        <TwoFactorPage/>
        </ScrollToTop></GuestRoute>,       
    },

    // user (protected — require valid in-memory token)

    {
        path: '/lockedin',
        element:<ProtectedRoute><ScrollToTop>
        <LockedInPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/library',
        element:<ProtectedRoute><ScrollToTop>
        <LibraryPage/>
        </ScrollToTop></ProtectedRoute>,       
    },
    
     {
        path: '/lockedin/upgrade',
        element:<ProtectedRoute><ScrollToTop>
        <UpgradePage/>
        </ScrollToTop></ProtectedRoute>,       
    },

    {
        path: '/lockedin/study-plan',
        element:<ProtectedRoute><ScrollToTop>
        <StudyPlanPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/invoices-&-billing',
        element:<ProtectedRoute><ScrollToTop>
        <BillingPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

    {
        path: '/lockedin/delete-account',
        element:<ProtectedRoute><ScrollToTop>
        <DeleteAccountPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/profile-settings',
        element:<ProtectedRoute><ScrollToTop>
        <ProfileSettingsPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/change-password',
        element:<ProtectedRoute><ScrollToTop>
        <ChangePasswordPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

    {
        path: '/lockedin/application-settings',
        element:<ProtectedRoute><ScrollToTop>
        <ApplicationSettingsPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

    {
        path: '/lockedin/notifications',
        element:<ProtectedRoute><ScrollToTop>
        <NotificationsPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/support-tickets',
        element:<ProtectedRoute><ScrollToTop>
        <SupportTicketsPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

    {
        path: '/lockedin/support-tickets/new',
        element:<ProtectedRoute><ScrollToTop>
        <NewSupportTicketsPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/support-tickets/show/:id',
        element:<ProtectedRoute><ScrollToTop>
        <SupportTicketPage/>
        </ScrollToTop></ProtectedRoute>,       
    },

     {
        path: '/lockedin/notes/new',
        element:<ProtectedRoute><ScrollToTop>
        <NotePage/>
        </ScrollToTop></ProtectedRoute>,       
    },

]);

export default AppRoutes;