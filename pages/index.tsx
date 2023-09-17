import type { NextPage } from 'next';
import Head from 'next/head';

import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from '@emotion/styled';
import MainWrapper from '../components/MainWrapper';
import AddForm from '../components/AddForm';
import SearchInput from '../components/Contacts/SearchInput';
import ContactsSection from '../components/Contacts';
import FavProvider from '../components/context/favContext';
import PaginationProvider from '../components/context/paginationContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
`;

const Main = styled.main`
  min-height: 100vh;
  flex-grow: 1;
  display: flex;
  justify-content: center;
`;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Phone Book</title>
        <meta name="description" content="Phone Book SPA" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Header />
        <Main>
          <FavProvider>
            <PaginationProvider>
              <MainWrapper>
                <SearchInput />
                <ContactsSection />
                <AddForm />
              </MainWrapper>
            </PaginationProvider>
          </FavProvider>
        </Main>
        <Footer />
      </Container>
    </>
  );
};

export default Home;
