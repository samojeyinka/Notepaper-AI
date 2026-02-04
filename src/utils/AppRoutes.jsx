import { createBrowserRouter } from 'react-router-dom';

import { LandingPage,PricingPage,SignUpPage,
    SignInPage,ForgotPasswordPage,CheckMailPage,AboutUsPage } from '../pages/pages';
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
    }
    
]);

export default AppRoutes;