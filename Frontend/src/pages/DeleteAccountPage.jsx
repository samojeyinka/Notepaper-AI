import React from 'react'
import DeleteAccountConfirm from '../components/profile-settings/DeleteAccountConfirm';
import Header from '../components/globals/Header'
import Footer from '../components/globals/Footer'

const DeleteAccountPage = () => {
    return (
        <>
            <Header/>
            <main className="min-h-[85vh] pt-12 bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
              <DeleteAccountConfirm />
            </main>
            <Footer/>
        </>
    )
}

export default DeleteAccountPage;
