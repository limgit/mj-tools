import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heading,
  VStack,
  Link as CUILink,
} from '@chakra-ui/react';
import { RoutePath } from '@/routes';

const Home: React.FC = () => {
  return (
    <VStack>
      <Heading size="md">Mahjong Tools</Heading>
      <CUILink as={Link} to={RoutePath.log}>Game Logging</CUILink>
    </VStack>
  );
};

export default Home;
