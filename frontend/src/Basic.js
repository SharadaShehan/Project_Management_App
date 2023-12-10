import { gql, useQuery } from '@apollo/client';
import { Text } from 'react-native';

const TEST_QUERY = gql`
    query test{
        hi
}
`;

function Basic() {
    const { loading, error, data } = useQuery(TEST_QUERY);
    
    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error.message}</Text>;

    return (
        <Text>{data.hi}</Text>
    );
}

export default Basic;