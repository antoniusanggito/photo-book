import { useContext, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from '@emotion/styled';
import Card from '../components/ContactCard';
import Wrapper from '../components/ContactCard/Wrapper';
import { fullCenter } from '../styles/commonStyles';
import { FavContext, FavContextType } from '../components/context/favContext';
import AddButton from '../components/AddButton';
import { css } from '@emotion/react';
import { useQuery } from '@apollo/client';
import { GET_FAV_CONTACTS } from '../graphql/getFavContacts';
import { GET_REG_CONTACTS } from '../graphql/getRegContacts';
import PaginationButton from '../components/PaginationButton';
import {
  useCountRegContactsQuery,
  useGetFavContactsQuery,
  useGetRegContactsQuery,
} from '../generated/graphql';
import getFavIds from '../utils/getFavIdQuery';
import {
  PaginationContext,
  PaginationContextType,
} from '../components/context/paginationContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  height: 100dvh;
`;

const Main = styled.main`
  height: 100%;
  display: flex;
  justify-content: center;
`;

const Home: NextPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { fav } = (useContext(FavContext) as FavContextType) ?? {};
  const { offset, limit, page, setOffset } =
    (useContext(PaginationContext) as PaginationContextType) ?? {};
  const favIds = getFavIds(fav);

  // graphql queries
  const {
    data: dataFav,
    loading: loadingFav,
    error: errorFav,
  } = useGetFavContactsQuery({ variables: { favIds } });

  const {
    data: dataReg,
    loading: loadingReg,
    error: errorReg,
  } = useGetRegContactsQuery({
    variables: { offset, limit, favIds },
  });

  const { data: dataCount, error: errorCount } = useCountRegContactsQuery({
    variables: { favIds },
  });

  // regContacts count
  let count = 0;
  if (dataCount) {
    count = dataCount.contact_aggregate.aggregate?.count as number;
  }

  const toggleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const handlePrev = () => {
    setOffset((prev) => (prev - limit < 0 ? 0 : prev - limit));
  };

  const handleNext = () => {
    setOffset((prev) => prev + limit);
  };

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
          <div
            css={css`
              position: fixed;
              bottom: 30px;
              right: 20px;

              @media screen and (min-width: 768px) {
                bottom: 5vw;
                right: 7vw;
              }

              @media screen and (min-width: 1024px) {
                bottom: 8vw;
                right: 15vw;
              }
            `}
          >
            <AddButton onClick={toggleModal} />
          </div>
          {dataFav && dataReg && (
            <Wrapper>
              {/* {(loading || loadingFav) && <div css={fullCenter}>Loading...</div>} */}
              {(errorReg || errorFav) && (
                <div css={fullCenter}>
                  {errorReg?.message} {errorFav?.message}
                </div>
              )}
              <div>
                <h3>Favorites ({dataFav.contact.length})</h3>
              </div>
              {dataFav.contact.map((contact: any) => (
                <Card
                  key={contact.id}
                  isFav={fav[contact.id]}
                  id={contact.id}
                  first_name={contact.first_name}
                  last_name={contact.last_name}
                  phones={contact.phones}
                />
              ))}
              <h3>Others</h3>
              {dataReg.contact.map((contact: any) => (
                <Card
                  key={contact.id}
                  isFav={fav[contact.id]}
                  id={contact.id}
                  first_name={contact.first_name}
                  last_name={contact.last_name}
                  phones={contact.phones}
                />
              ))}

              {/* Pagination button */}
              <section css={fullCenter}>
                <PaginationButton
                  type="prev"
                  onClick={handlePrev}
                  disabled={page == 1}
                />
                <h4
                  css={css`
                    margin: 0 1rem;
                  `}
                >
                  {page}
                </h4>
                <PaginationButton
                  type="next"
                  onClick={handleNext}
                  disabled={page * limit >= count}
                />
              </section>
            </Wrapper>
          )}
        </Main>

        <Footer />
      </Container>
    </>
  );
};

export default Home;
