import { createBrowserRouter } from 'react-router-dom';

import { LandingPage,PricingPage,SignUpPage,
    SignInPage,ForgotPasswordPage,CheckMailPage,AboutUsPage,FeaturesPage,
    ContactUsPage, HowItWorksPage,OurStoryPage,PrivacyPage,
     LockedInPage,UpgradePage, StudyPlanPage } from '../pages/pages';
import ScrollToTop from './ScrollToTop';

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
        path: '/signup',
        element:<ScrollToTop>
        <SignUpPage/>
        </ScrollToTop>,       
    },
     {
        path: '/signin',
        element:<ScrollToTop>
        <SignInPage/>
        </ScrollToTop>,       
    },
    {
        path: '/forgot-password',
        element:<ScrollToTop>
        <ForgotPasswordPage/>
        </ScrollToTop>,       
    },
     {
        path: '/forgot-password/check-email',
        element:<ScrollToTop>
        <CheckMailPage/>
        </ScrollToTop>,       
    },


    // user

    {
        path: '/lockedin',
        element:<ScrollToTop>
        <LockedInPage/>
        </ScrollToTop>,       
    },
    
     {
        path: '/lockedin/upgrade',
        element:<ScrollToTop>
        <UpgradePage/>
        </ScrollToTop>,       
    },

    {
        path: '/lockedin/study-plan',
        element:<ScrollToTop>
        <StudyPlanPage/>
        </ScrollToTop>,       
    },

]);

export default AppRoutes;